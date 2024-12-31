import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Box, Divider, List } from "@mui/material";
import { useLocation, NavLink } from "react-router-dom";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";
import SidenavCollapse from "components/SidenavCollapse";
import MDButton from "components/MDButton";
import Icon from "@mui/material/Icon";
import useMaterialUIController, {
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

function SidenavModal({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");
  const { currentUser, logout } = useAuth();
  const [open, setOpen] = useState(false); // State to control modal visibility

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSignOut = async () => {
    console.log(currentUser);
    try {
      await logout();
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();

    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  const renderRoutes = routes.map(({ type, name, icon, title, noCollapse, key, href, route }) => {
    if (type === "collapse") {
      return href ? (
        <NavLink key={key} to={route}>
          <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
        </NavLink>
      ) : null;
    }

    if (type === "title") {
      return (
        <MDTypography
          key={key}
          color="white"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </MDTypography>
      );
    }

    if (type === "divider") {
      return <Divider key={key} light />;
    }

    return null;
  });

  return (
    <>
      {/* Button to open modal */}
      <MDButton variant="gradient" color="info" onClick={handleOpen}>
        Open Sidenav
      </MDButton>

      {/* Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <MDTypography variant="h6" color="info">
              Sidenav
            </MDTypography>
            <Icon onClick={handleClose} sx={{ cursor: "pointer" }}>
              close
            </Icon>
          </MDBox>
          <Divider />
          <List>{renderRoutes}</List>
          <MDBox mt={3}>
            <MDButton variant="gradient" color={sidenavColor} fullWidth onClick={handleSignOut}>
              Sign out
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </>
  );
}

// Setting default values for the props of Sidenav
SidenavModal.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
SidenavModal.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SidenavModal;
