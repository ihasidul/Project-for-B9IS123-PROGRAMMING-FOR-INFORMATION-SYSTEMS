import { AppBar, Toolbar, Typography, Button, Box, Chip } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography
                    variant="h6"
                    component={Link}
                    to={isAuthenticated() && user?.userType === 'seller' ? '/dashboard' : '/'}
                    sx={{
                        flexGrow: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer'
                    }}
                >
                    FarmDirect
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isAuthenticated() ? (
                        <>
                            {user?.userType === 'seller' && (
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/dashboard"
                                >
                                    Dashboard
                                </Button>
                            )}
                            <Chip
                                label={`${user.username} (${user.userType})`}
                                variant="outlined"
                                sx={{ color: 'white', borderColor: 'white' }}
                            />
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                variant="outlined"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/login"
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/register"
                                variant="outlined"
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}