import { AppBar, Toolbar, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";

export default function Header() {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        colorv: 'inherit',
                        cursor: 'pointer'
                    }}
                >
                    FarmDirect
                </Typography>
            </Toolbar>
        </AppBar>
    );
}