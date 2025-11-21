import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getProductById, getProductReviews } from '../../api/productApi'
import { useAppContext } from '../../contexts/AppContext'; // ✅ Import context
import styles from './ProductDetailPage.module.css';

import ImageGallery from '../../components/ImageGallery/ImageGallery';
import ProductInfo from '../../components/ProductInfo/ProductInfo';
import ProductReviews from '../../components/ProductReviews/ProductReviews';

const ProductDetailPage = () =>{
    const { productId } = useParams();
    const { addToCart, isAuthenticated } = useAppContext(); // ✅ Lấy từ context
    
    const [productData, setProductData] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [activeVariant, setActiveVariant] = useState (null);
    const [quantity, setQuantity] = useState (1);
    const [loading, setLoading] = useState (true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false); // ✅ Trạng thái đang thêm vào giỏ

    useEffect(() => {
        const fetchProductData = async () =>{
            try{
                setLoading(true);
                setError(null);
                const [productResponse, reviewsResponse] = await Promise.all([
                    getProductById(productId),
                    getProductReviews(productId)
                ]);
                const data = productResponse.data;
                setProductData(data);
                setReviews(reviewsResponse.data.reviews);
                if(data.variants && data.variants.length > 0){
                    const initialVariant = data.variants[0];
                    setActiveVariant(initialVariant);
                    const initialSelections = {};
                    initialVariant.options.forEach(opt => {
                       initialSelections[opt.product_option_id] = opt.value.option_value_id;
                    })
                    setSelectedOptions(initialSelections);
                }
            }
            catch(error){
                console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
                setError('Failed to load data product. Please try again later.');
            }
            finally{
                setLoading(false);
            }
        };
        fetchProductData();
    },[productId]);

    // Logic tim variant khi lua chon thay doi
    useEffect(() => {
        if(!productData || !productData.variants) return;

        const newActiveVariant = productData.variants.find(variant => {
            return variant.options.every(variantOption => {
                const optionId = variantOption.product_option_id;
                const valueId = variantOption.value.option_value_id;
                return selectedOptions[optionId] === valueId;
            });
        });
        setActiveVariant (newActiveVariant || null);
        setQuantity(1); // reset quantity when variant changes
    }, [selectedOptions, productData]);
    
    // Các hàm xử lý sự kiện

    const handleOptionSelect = (optionId, valueId) => {
        setSelectedOptions(prevSelections => ({
            ...prevSelections,
            [optionId]: valueId,
        }));
    };

    const handleQuantityChange = (newQuantity) => {
        if(activeVariant){
            setQuantity(Math.min(newQuantity, activeVariant.stock));
        }
    };

    // ✅ Cập nhật hàm handleAddToCart
    const handleAddToCart = async () => {
        // Kiểm tra đã đăng nhập chưa
        if (!isAuthenticated) {
            alert('You need to login to add products to cart!');
            window.location.href = '/login';
            return;
        }

        // Kiểm tra đã chọn variant chưa
        if (!activeVariant) {
            alert('Please select all product options!');
            return;
        }

        // Kiểm tra còn hàng không
        if (activeVariant.stock <= 0) {
            alert('This product is currently out of stock!');
            return;
        }

        // Kiểm tra số lượng hợp lệ
        if (quantity <= 0 || quantity > activeVariant.stock) {
            alert(`Quantity must be between 1 and ${activeVariant.stock}!`);
            return;
        }

        try {
            setAddingToCart(true);
            
            // Gọi hàm addToCart từ context
            await addToCart(activeVariant.product_variant_id, quantity);
            
            // Thông báo thành công
            alert(`Added ${quantity} product(s) to the cart!`);
            
            // Reset số lượng về 1
            setQuantity(1);
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            
            // Handle specific error types
            if (error.response?.status === 401) {
                alert('Your session has expired. Please log in again!');
                window.location.href = '/login';
            } else if (error.response?.status === 400) {
                alert(error.response.data.error || 'Failed to add product to cart!');
            } else {
                alert('An error occurred. Please try again later!');
            }
        } finally {
            setAddingToCart(false);
        }
    };

    if(loading){
        return <div className={styles.loadingContainer}>Đang tải...</div>;
    }
    if(error){
        return <div className={styles.errorContainer}>{error}</div>;
    }
    if(!productData){
        return <div className={styles.errorContainer}>Không tìm thấy sản phẩm.</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.mainContent}>
                <ImageGallery images={activeVariant ? activeVariant.images : []} />
                <ProductInfo
                    productData={productData}
                    activeVariant={activeVariant}
                    selectedOptions={selectedOptions}
                    quantity={quantity}
                    onOptionSelect={handleOptionSelect}
                    onQuantityChange={handleQuantityChange}
                    onAddToCart={handleAddToCart}
                    isAddingToCart={addingToCart} // ✅ Truyền trạng thái loading
                />
            </div>
            <ProductReviews reviews={reviews} />
        </div>
    );
};

export default ProductDetailPage;
