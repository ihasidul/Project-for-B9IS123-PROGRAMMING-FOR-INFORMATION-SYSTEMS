import { createFileRoute } from '@tanstack/react-router';
import ProductTable from '../ProductTable.jsx';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div>
      <h1>Products</h1>
      <div>
        <ProductTable />
      </div>
    </div>
  );
}
