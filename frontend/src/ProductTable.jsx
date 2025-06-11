
import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import getAllProducts from "../api/getAllProducts"; 

let data = await getAllProducts(0, 10); // Fetch initial data
console.log("Data fetched from API:", data); // Log the fetched data

const columns = [
  { id: 'id', label: 'Product ID', minWidth: 170 },
  { id: 'name', label: 'Product Name', minWidth: 170 },
  { id: 'description', label: 'Description', minWidth: 100 },
  {
    id: 'price',
    label: 'Price',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'category',
    label: 'Category',
    minWidth: 170,
    align: 'right',
  },
  {
    id: 'photo',
    label: 'Photo',
    minWidth: 170,
    align: 'right',
  },
];


const rows = data.map((product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  status: product.is_active,
  category: product.category,
  photo: product.photo ? <img src={product.photo_url} alt={product.name} style={{ width: '50px', height: '50px' }} /> : 'No Image',
}));

export default function ProductTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
