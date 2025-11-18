import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getProductById, getProductReviews } from '../../api/productApi'
import styles from './ProductDetailPage.module.css';

import ImageGallery from '../../components/ImageGallery/ImageGallery';
import ProductInfo from '../../components/ProductInfo/ProductInfo';
import ProductReviews from '../../components/ProductReviews/ProductReviews';

// test
// import { mockProductData } from '../_mocks/mockProductData';
// import { mockReviewsData } from '../_mocks/mockReviewsData';


const ProductDetailPage = () =>{
    const { productId } = useParams();
    
    const [productData, setProductData] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [activeVariant, setActiveVariant] = useState (null);
    const [quantity, setQuantity] = useState (1);
    const [loading, setLoading] = useState (true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);


    // Uncomment phần này để dùng mock data
//     useEffect(() => {
//     const fetchMockData = () => {
//       setLoading(true);
//       setError(null);
//       setTimeout(() => {
//         // Lấy dữ liệu sản phẩm
//         const productData = mockProductData;
//         setProductData(productData);

//         // Lấy dữ liệu review
//         const reviewsData = mockReviewsData;
//         setReviews(reviewsData.reviews); // <-- THÊM DÒNG NÀY

//         // Khởi tạo variant mặc định (giữ nguyên)
//         if (productData && productData.variants && productData.variants.length > 0) {
//           const initialVariant = productData.variants[0];
//           setActiveVariant(initialVariant);
//           const initialSelections = {};
//           initialVariant.options.forEach(opt => {
//             initialSelections[opt.product_option_id] = opt.values[0].option_value_id;
//           });
//           setSelectedOptions(initialSelections);
//         }
        
//         setLoading(false);
//       }, 500);
//     };

//     fetchMockData();
//   }, [productId]);


    // Comment phần này lại khi dùng mock
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
                       initialSelections[opt.product_option_id] = opt.values[0].option_value_id;
                    })
                    setSelectedOptions(initialSelections);
                }
            }
            catch(error){
                console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
                setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
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
                const valueId = variantOption.values[0].option_value_id;
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
    const handleAddToCart = () => {
        if (!activeVariant){
            alert('Please select all options!');
            return;
        }
        console.log(`Thêm vào giỏ hàng: Variant ID ${activeVariant.variant_id}, Số lượng: ${quantity}`);
        // Gọi API hoặc cập nhật trạng thái giỏ hàng ở đây


    }


    // render giao diện
    if(loading){
        return <div className={styles.loadingContainer}>Loading...</div>;
    }
    if(error){
        return <div className={styles.errorContainer}>{error}</div>;
    }
    if(!productData){
        return <div className={styles.errorContainer}> No products found.</div>;
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
            />
            </div>
            <ProductReviews reviews={reviews} />
        </div>
    );
};

export default ProductDetailPage;
