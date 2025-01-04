import React from "react";
import PropTypes from "prop-types";
import { Link, NavLink, useLocation } from "react-router-dom";
import { List, Divider } from "@mui/material";

function Sidenav2({ routes }) {
  // const { currentUser, logout } = useAuth();
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  const handleSignOut = async () => {
    try {
      // await logout();
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  const renderRoutes = routes.map(({ type, name, icon, key, href, route }) => {
    if (type === "collapse") {
      return href ? (
        <button
          onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
          key={key}
          className="link-container"
        >
          <div>
            {icon} {name}
          </div>
        </button>
        ) : (
        <Link key={key} to={route}>
          {name !== "Sign In" && name !== "Sign Up" && (
            <div>
              {icon} {name}
            </div>
          )}
        </Link>

      );
    }

    if (type === "divider") {
      return <Divider key={key} />;
    }

    return null;
  });

  return (
    <div>
      <div>
        <NavLink to="/">
          <div>Atom Connect</div>
        </NavLink>
      </div>
      <Divider />
      <List>{renderRoutes}</List>
      {/*<div onClick={handleSignOut} style={{ cursor: "pointer", marginTop: "auto" }}>*/}
      {/*  <button>Sign Out</button>*/}
      {/*</div>*/}
    </div>
  );
}

Sidenav2.propTypes = {
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      name: PropTypes.string,
      icon: PropTypes.node,
      key: PropTypes.string.isRequired,
      href: PropTypes.string,
      route: PropTypes.string,
    })
  ).isRequired,
};

export default Sidenav2;
