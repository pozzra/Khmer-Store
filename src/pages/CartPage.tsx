import { FC, useState, useMemo } from 'react';
import { List, Section, Cell, Button, Image, Checkbox } from '@telegram-apps/telegram-ui';
import { Plus, Minus, Trash2, X, ShoppingCart, DollarSign } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { Page } from '@/components/Page';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '@/components/CartContext';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

export const CartPage: FC = () => {
  const { cart, removeFromCart, clearCart, increment, decrement, updateQuantity } = useCart();
  const total = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  const cartData = cart.map((item: CartItem) => ({
    id: item.id,
    name: item.name,
    qty: item.quantity,
    price: item.price,
  }));
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();

  // Checkout handler
  const handleOrder = () => {
    if (!username.trim() || !phone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    // Validate phone is only digits
    if (!/^\d+$/.test(phone)) {
      alert('Phone number must contain only digits.');
      return;
    }

    // Debug log
    console.log('Submitting order:', { username, phone, cart: cartData });

    fetch('http://localhost:8000/api/orders', { // Use 8000 if that's your backend port!
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        phone,
        cart: cartData,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrderSuccess(true);
          setIsModalOpen(false);
          clearCart();
          alert('Order sent to admin! You will be contacted soon.');
        } else {
          alert('Order failed! Please try again.');
        }
      })
      .catch((err) => {
        alert('Order failed! Please check your connection and try again.');
        console.error(err);
      });
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const selectAll = () => setSelected(cart.map((item: CartItem) => item.id));
  const clearSelection = () => setSelected([]);
  const deleteSelected = () => {
    selected.forEach(id => removeFromCart(id));
    setSelected([]);
  };

  return (
    <Page>
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 10 }}>
          <div style={{ background: 'var(--tg-theme-secondary-bg-color, #2c2c2e)', padding: 20, borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', width: '100%', maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, textAlign: 'center', color: 'var(--tg-theme-text-color, #ffffff)', fontFamily: 'serif' }}>Enter Your Details</h3>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Name"
              style={{ width: '100%', padding: 12, boxSizing: 'border-box', borderRadius: 8, border: '1px solid var(--tg-theme-hint-color, #444)', background: 'var(--tg-theme-bg-color, #1c1c1d)', color: 'var(--tg-theme-text-color, #fff)', marginBottom: 12 }}
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/[^0-9]/g, '');
                setPhone(value);
              }}
              placeholder="Your Phone Number"
              style={{ width: '100%', padding: 12, boxSizing: 'border-box', borderRadius: 8, border: '1px solid var(--tg-theme-hint-color, #444)', background: 'var(--tg-theme-bg-color, #1c1c1d)', color: 'var(--tg-theme-text-color, #fff)' }}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <Button size="m" style={{ flex: 1, background: '#f8f9fa', color: '#212529', borderRadius: 8, fontWeight: 600 }} onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button size="m" style={{ flex: 1, background: 'var(--tg-theme-button-color, #007bff)', color: 'var(--tg-theme-button-text-color, #ffffff)', borderRadius: 8, fontWeight: 600 }} onClick={handleOrder}>Submit</Button>
            </div>
          </div>
        </div>
      )}
      <List>
        <Section header="Your Cart">
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--tg-theme-secondary-bg-color, #fff)', cursor: 'pointer' }} onClick={() => navigate('/') }>
              <ShoppingCart size={48} style={{ marginBottom: 16, color: '#bbb' }} />
              <div style={{ color: '#888', fontSize: 20, fontWeight: 500 }}>Your cart is empty.</div>
              <div style={{ color: '#aaa', fontSize: 14, marginTop: 8 }}>Tap to return to shop</div>
            </div>
          ) : (
            cart.map((item: CartItem) => (
              <Cell
                key={item.id}
                before={
                  editMode ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Checkbox checked={selected.includes(item.id)} onChange={() => toggleSelect(item.id)} />
                      <Image src={`http://localhost:8001/storage/${item.mage}`} style={{ width: 32, height: 32, borderRadius: 6 }} />
                    </div>
                  ) : (
                    <Image src={`http://localhost:8001/storage/${item.mage}`} style={{ width: 36, height: 36, borderRadius: 8, marginRight: 8 }} />
                  )
                }
                subtitle={<span style={{ color: '#fff' }}>${item.price.toFixed(2)} x {item.quantity}</span>}
                style={{
                  background: editMode
                    ? selected.includes(item.id)
                      ? '#444' // selected: gray
                      : 'var(--tg-theme-secondary-bg-color, #222)' // unselected: website bg
                    : 'var(--tg-theme-secondary-bg-color, #fff)',
                  color: editMode ? '#fff' : '#000',
                  borderRadius: 8,
                  marginBottom: 8,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  padding: 4,
                  alignItems: 'center',
                  display: 'flex',
                  cursor: editMode ? 'pointer' : 'default',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
                onClick={editMode ? () => toggleSelect(item.id) : undefined}
                after={
                  editMode ? null : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, background: 'rgba(0,0,0,0.15)', borderRadius: 6, padding: '2px 6px', minWidth: 120 }}>
                      <Button
                        size="s"
                        before={<Minus size={14} />}
                        onClick={e => { e.stopPropagation(); decrement(item.id); }}
                        style={{ background: 'none', color: item.quantity === 1 ? '#6c757d' : '#007bff', borderRadius: '6px 0 0 6px', width: 28, height: 28, minWidth: 28, minHeight: 28, padding: 0, fontSize: 16, boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        disabled={item.quantity === 1}
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => {
                          const value = Math.max(1, Number(e.target.value));
                          updateQuantity(item.id, value);
                        }}
                        style={{ width: 40, textAlign: 'center', fontWeight: 600, border: 'none', background: 'transparent', fontSize: 15, height: 28, color: '#fff', outline: 'none', margin: '0 1px' }}
                        onClick={e => e.stopPropagation()}
                      />
                      <Button
                        size="s"
                        before={<Plus size={14} />}
                        onClick={e => { e.stopPropagation(); increment(item.id); }}
                        style={{ background: 'none', color: '#007bff', borderRadius: '0 6px 6px 0', width: 28, height: 28, minWidth: 28, minHeight: 28, padding: 0, fontSize: 16, boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      />
                    </div>
                  )
                }
              >
                <span style={{ fontWeight: 600, fontSize: 16, color: '#fff' }}>{item.name}</span>
              </Cell>
            ))
          )}
        </Section>
      </List>
      {cart.length > 0 && editMode && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'var(--tg-theme-secondary-bg-color, #fff)', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', padding: '16px 16px 24px 16px', zIndex: 100 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              size="m"
              style={{ borderRadius: 8, flex: 1, background: '#f8f9fa', color: '#212529', fontWeight: 600 }}
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button
              size="m"
              style={{ borderRadius: 8, flex: 1, background: selected.length ? '#dc3545' : '#6c757d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}
              onClick={deleteSelected}
              disabled={!selected.length}
              before={<Trash2 size={18} />}
            >
              Delete
            </Button>
            <Button
              size="m"
              style={{ borderRadius: 8, flex: 1, background: '#007bff', color: '#fff', fontWeight: 600 }}
              onClick={() => { setEditMode(false); clearSelection(); }}
            >
              Done
            </Button>
          </div>
        </div>
      )}
      {cart.length > 0 && !editMode && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: 'var(--tg-theme-secondary-bg-color, #fff)', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', padding: '16px 16px 24px 16px', zIndex: 100 }}>
          <div style={{ fontWeight: 600, fontSize: 18, display: 'flex', alignItems: 'center', marginBottom: 8, color: '#888', marginTop: 10 }}>
            <DollarSign size={18} style={{ marginRight: 6, color: '#007AFF' }} />
            Total
            <span style={{ marginLeft: 'auto', color: '#fff', background: '#007AFF', borderRadius: 6, padding: '2px 12px', fontSize: 18, fontWeight: 700 }}>
              ${total.toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button
              size="m"
              style={{ borderRadius: 8, flex: 1, background: '#f8f9fa', color: '#212529', fontWeight: 600 }}
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
            <Button
              size="m"
              style={{ borderRadius: 8, flex: 2, background: '#007bff', color: '#fff', fontWeight: 600 }}
              onClick={() => setIsModalOpen(true)}
            >
              Check Out
            </Button>
          </div>
        </div>
      )}
      {orderSuccess && (
        <div style={{ color: 'green', textAlign: 'center', marginTop: 16 }}>
          Order sent to admin! You will be contacted soon.
        </div>
      )}
    </Page>
  );
}; 