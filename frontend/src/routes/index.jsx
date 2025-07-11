import { createFileRoute } from '@tanstack/react-router';
import ProductBrowser from '../components/products/ProductBrowser.jsx';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return <ProductBrowser />;
}
