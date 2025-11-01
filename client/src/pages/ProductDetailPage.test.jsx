import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductDetailPage from './ProductDetailPage';
import { mockProductData } from '../_mocks/mockProductData';
import * as productApi from '../api/productApi';

// Mock the API
vi.mock('../api/productApi', () => ({
  getProductById: vi.fn(),
}));

// Mock child components để tránh phụ thuộc vào chúng
vi.mock('../components/ImageGallery', () => ({
  default: ({ images }) => (
    <div data-testid="image-gallery">
      {images && images.map((img, idx) => (
        <img key={idx} src={img.image_url} alt={`Product ${idx}`} />
      ))}
    </div>
  ),
}));

vi.mock('../components/ProductInfo', () => ({
  default: ({ productData, activeVariant, selectedOptions, quantity, onOptionSelect, onQuantityChange, onAddToCart }) => (
    <div data-testid="product-info">
      <h1>{productData?.name || productData?.product_name}</h1>
      <p>Giá: {activeVariant?.price}</p>
      <p>Stock: {activeVariant?.stock}</p>
      <input 
        type="number" 
        value={quantity} 
        onChange={(e) => onQuantityChange(parseInt(e.target.value))}
        data-testid="quantity-input"
      />
      <button onClick={() => onQuantityChange(quantity + 1)}>+</button>
      <button onClick={() => onQuantityChange(quantity - 1)}>-</button>
      <button onClick={onAddToCart} data-testid="add-to-cart">Thêm vào giỏ</button>
    </div>
  ),
}));

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(productApi.getProductById).mockImplementationOnce(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <MemoryRouter initialEntries={['/product/test-id']}>
        <Routes>
          <Route path="/product/:productId" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Đang tải...')).toBeInTheDocument();
  });

  it('should render product details after loading', async () => {
    vi.mocked(productApi.getProductById).mockResolvedValueOnce({
      data: mockProductData,
    });

    render(
      <MemoryRouter initialEntries={['/product/test-id']}>
        <Routes>
          <Route path="/product/:productId" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Chờ cho ProductInfo render xong
    await waitFor(
      () => {
        expect(screen.getByTestId('product-info')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Kiểm tra tên sản phẩm được render (có thể là 'name' hoặc 'product_name')
    const productName = screen.getByRole('heading');
    expect(productName.textContent).toBeTruthy();
  });

  it('should display image gallery with active variant images', async () => {
    vi.mocked(productApi.getProductById).mockResolvedValueOnce({
      data: mockProductData,
    });

    render(
      <MemoryRouter initialEntries={['/product/test-id']}>
        <Routes>
          <Route path="/product/:productId" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('image-gallery')).toBeInTheDocument();
    });

    const images = screen.queryAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should update quantity when increment button is clicked', async () => {
    const user = userEvent.setup();
    
    vi.mocked(productApi.getProductById).mockResolvedValueOnce({
      data: mockProductData,
    });

    render(
      <MemoryRouter initialEntries={['/product/test-id']}>
        <Routes>
          <Route path="/product/:productId" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('product-info')).toBeInTheDocument();
    });

    const incrementButton = screen.getByRole('button', { name: '+' });
    const quantityInput = screen.getByTestId('quantity-input');

    // Initial quantity should be 1
    expect(quantityInput).toHaveValue(1);

    // Click increment button
    await user.click(incrementButton);

    // Quantity should increase to 2
    await waitFor(() => {
      expect(quantityInput).toHaveValue(2);
    });
  });
});
