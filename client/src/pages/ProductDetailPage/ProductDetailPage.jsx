import { useParams, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getProductById, getProductReviews, getAllProducts, addProductReview } from '../../api/productApi'
import { useAppContext } from '../../contexts/AppContext';
import styles from './ProductDetailPage.module.css';

import ImageGallery from '../../components/ImageGallery/ImageGallery';
import ProductInfo from '../../components/ProductInfo/ProductInfo';
import ProductReviews from '../../components/ProductReviews/ProductReviews';
import ProductCard from '../../components/ProductCard/ProductCard'; 

const ProductDetailPage = () => {
    const { productId } = useParams();
    const { addToCart, isAuthenticated } = useAppContext();
    
    const [productData, setProductData] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [activeVariant, setActiveVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [notification, setNotification] = useState({show: false, message:'', type:''});
    const [averageRating, setAverageRating]= useState(0);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [productResponse, reviewsResponse] = await Promise.all([
                    getProductById(productId),
                    getProductReviews(productId)
                ]);
                const data = productResponse.data;
                setProductData(data);
                setReviews(reviewsResponse.data.reviews);

                const reviewsList = reviewsResponse.data.reviews;
                if(reviewsList && reviewsList.length >0){
                    const totalRating = reviewsList.reduce((sum, review) => sum + review.rating,0);
                    setAverageRating(totalRating / reviewsList.length);
                }
                else{
                    setAverageRating(0);
                }

                //  Fetch related products
                if (data.categories && data.categories.length > 0) {
                    const categoryCode = data.categories[0].category_code;
                    const relatedResponse = await getAllProducts({
                        categories: [categoryCode],
                        limit: 4
                    });
                    setRelatedProducts(
                        relatedResponse.items.filter(p => p.product_id !== productId)
                    );
                }

                if (data.variants && data.variants.length > 0) {
                    const initialVariant = data.variants[0];
                    setActiveVariant(initialVariant);
                    const initialSelections = {};
                    initialVariant.options.forEach(opt => {
                       initialSelections[opt.product_option_id] = opt.value.option_value_id;
                    })
                    setSelectedOptions(initialSelections);
                }
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
                setError('Failed to load product data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
    }, [productId]);

    useEffect(() => {
        if (!productData || !productData.variants) return;

        const newActiveVariant = productData.variants.find(variant => {
            return variant.options.every(variantOption => {
                const optionId = variantOption.product_option_id;
                const valueId = variantOption.value.option_value_id;
                return selectedOptions[optionId] === valueId;
            });
        });
        setActiveVariant(newActiveVariant || null);
        setQuantity(1);
    }, [selectedOptions, productData]);
    
    const handleOptionSelect = (optionId, valueId) => {
        setSelectedOptions(prevSelections => ({
            ...prevSelections,
            [optionId]: valueId,
        }));
    };

    const handleQuantityChange = (newQuantity) => {
        if (activeVariant) {
            setQuantity(Math.min(newQuantity, activeVariant.stock));
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            alert('You need to login to add products to cart!');
            window.location.href = '/login';
            return;
        }
    
    

        if (!activeVariant) {
            alert('Please select all product options!');
            return;
        }

        if (activeVariant.stock <= 0) {
            alert('This product is currently out of stock!');
            return;
        }

        if (quantity <= 0 || quantity > activeVariant.stock) {
            alert(`Quantity must be between 1 and ${activeVariant.stock}!`);
            return;
        }

        try {
            setAddingToCart(true);
            await addToCart(activeVariant.product_variant_id, quantity);
            alert(`Added ${quantity} product(s) to the cart!`);
            setQuantity(1);
        } catch (error) {
            console.error('Error adding to cart:', error);
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

    const handleAddReview = async (reviewData) => {
        try {   
            setSubmittingReview(true);
            const response = await addProductReview(productId, reviewData);

            setReviews(prevReviews =>{

            
                const newReviews= [response.data, ...prevReviews];
                const totalRating = newReviews.reduce((sum, review) => sum + review.rating, 0);
                setAverageRating(totalRating / newReviews.length);
                
                return newReviews;
        });
            setNotification({
                show: true,
                message: 'Cảm ơn bạn đã đánh giá sản phẩm!',
                type: 'success'
            });
            

            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 2000);
        }
        catch(error){
            console.error('Lỗi thêm sản phẩm:', error);
             setNotification({
                show: true,
                message: error.response?.status === 401 
                    ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!' 
                    : error.response?.data?.error || 'Không thể gửi đánh giá. Vui lòng thử lại!',
                type: 'error'
            });
            
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            
            if (error.response?.status === 401) {
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            }
        }
        finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <div className={styles.loadingContainer}>Loading product...</div>;
    }

    if (error) {
        return <div className={styles.errorContainer}>{error}</div>;
    }

    if (!productData) {
        return <div className={styles.errorContainer}>Product not found</div>;
    }

    return (
        <div className={styles.pageContainer}>
            {notification.show && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    {notification.message}
                </div>
            )}
            {/* Breadcrumb */}
            <nav className={styles.breadcrumb}>
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/products">Products</Link>
                <span>/</span>
                <span>{productData.name}</span>
            </nav>

            {/* Main Product Info */}
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
                    isAddingToCart={addingToCart}
                    averageRating={averageRating} 
                    reviewCount={reviews.length} 
                />
            </div>

            {/* Product Tabs */}
            <div className={styles.productTabs}>
                <div className={styles.tabButtons}>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'description' ? styles.active : ''}`}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({reviews.length})
                    </button>
                    <button 
                        className={`${styles.tabButton} ${activeTab === 'shipping' ? styles.active : ''}`}
                        onClick={() => setActiveTab('shipping')}
                    >
                        Shipping Info
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'description' && (
                        <div className={styles.description}>
                            <h3>Product Description</h3>
                            <p>{productData.description || 'No description available.'}</p>
                        </div>
                    )}
                    
                    {activeTab === 'reviews' && (
                        <ProductReviews 
                        reviews={reviews}
                        isAuthenticated={isAuthenticated}
                        onAddReview={handleAddReview}
                        isSubmitting={submittingReview}
                         />
                    )}
                    
                    {activeTab === 'shipping' && (
                        <div className={styles.description}>
                            <h3>Shipping Information</h3>
                            <p>Free shipping for orders over 500,000 VND</p>
                            <p> Delivery within 3-5 business days</p>
                            <p> 30-day return policy</p>
                            <p> Cash on delivery available</p>
                        </div>
                    )}
                </div>
            </div>

            {/*  Related Products */}
            {relatedProducts.length > 0 && (
                <div className={styles.relatedProducts}>
                    <h2>You May Also Like</h2>
                    <div className={styles.productGrid}>
                        {relatedProducts.map((product) => (
                            <ProductCard key={product.product_id} product={product} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;