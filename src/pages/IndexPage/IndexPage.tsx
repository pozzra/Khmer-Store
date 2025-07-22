import { Section, Cell, Image, List, Button } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';

import { Page } from '@/components/Page.tsx';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/CartContext';

export interface Product {
  id: number;
  name: string;
  price: number;
  mage: string; // <-- match backend
  dsc: string;  // <-- if you want to show description
}

export const IndexPage: FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('http://localhost:8001/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]));
  }, []);

  const handleOrder = (product: Product) => {
    addToCart(product);
  };

  if (!products.length) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: 32 }}>No products found.</div>;
  }

  return (
    <Page back={false}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 16px' }}>
        <Link to="/cart">
          <Button before={<ShoppingCart size={20} />}>Cart</Button>
        </Link>
      </div>
      <List>
        <Section header="Shop Products">
          {products.map((product) => (
            <Cell
              key={product.id}
              before={<Image src={`http://localhost:8001/storage/${product.mage}`} style={{ width: 56, height: 56, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}/>} 
              subtitle={
                <>
                  <span style={{ color: '#ccc' }}>{product.dsc}</span>

                  <br />
                  <span style={{ fontWeight: 500, color: '#fff' }}>${product.price.toFixed(2)}</span>

                </>
              }
              multiline
              style={{
                background: 'var(--tg-theme-secondary-bg-color, #222)',
                borderRadius: 16,
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                padding: 8,
                alignItems: 'center',
                display: 'flex',
              }}
              after={
                <Button
                  size="s"
                  before={<Plus size={16} />}
                  onClick={() => handleOrder(product)}
                  style={{ background: '#007AFF', color: '#fff', borderRadius: 8 }}
                >
                  Add
                </Button>
              }
            >
              <span style={{ fontWeight: 600, fontSize: 16, color: '#fff' }}>{product.name}</span>
            </Cell>
          ))}
        </Section>
      </List>
    </Page>
  );
};
