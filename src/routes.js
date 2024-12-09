/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Admin from "Custom/Admin";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";
import UsersTable from "./Custom/Admin/Users";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    protected: true,
    component: <Dashboard />,
  },
  // {
  //   type: "collapse",
  //   name: "Age",
  //   key: "age",
  //   icon: <Icon fontSize="small">family_restroom</Icon>,
  //   route: "/age",
  //   protected: true,
  //   component: <Dashboard />,
  // },
  // {
  //   type: "collapse",
  //   name: "Audience",
  //   key: "audience",
  //   icon: <Icon fontSize="small">public</Icon>,
  //   route: "/audience",
  //   protected: true,
  //   component: <Dashboard />,
  // },
  // {
  //   type: "collapse",
  //   name: "Campaign",
  //   key: "campaign",
  //   icon: <Icon fontSize="small">campaign</Icon>,
  //   route: "/campaign",
  //   protected: true,
  //   component: <Dashboard />,
  // },
  // {
  //   type: "collapse",
  //   name: "Device",
  //   key: "device",
  //   icon: <Icon fontSize="small">devices</Icon>,
  //   route: "/device",
  //   protected: true,
  //   component: <Dashboard />,
  // },
  // {
  //   type: "collapse",
  //   name: "Gender",
  //   key: "gender",
  //   icon: <Icon fontSize="small">wc</Icon>,
  //   route: "/gender",
  //   protected: true,
  //   component: <Dashboard />,
  // },
  // {
  //   type: "collapse",
  //   name: "Performing Hours",
  //   key: "performingHours",
  //   icon: <Icon fontSize="small">access_time</Icon>,
  //   route: "/hours",
  //   protected: true,
  //   component: <Dashboard />,
  // },
  // {
  //   type: "collapse",
  //   name: "Store",
  //   key: "store",
  //   icon: <Icon fontSize="small">store</Icon>,
  //   route: "/store",
  //   protected: true,
  //   component: <Dashboard />,
  // },
  // {
  //   type: "collapse",
  //   name: "Video Performance",
  //   key: "videoPerformance",
  //   icon: <Icon fontSize="small">slow_motion_video</Icon>,
  //   route: "/videp",
  //   protected: true,
  //   component: <Dashboard />,
  // },
  // {
  //   type: "collapse",
  //   name: "Assign",
  //   key: "assign",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },
   {
    type: "collapse",
    name: "Admin",
    key: "admin",
    protected: true,
    icon: <Icon fontSize="small">person</Icon>,
    route: "/admin",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Users",
    key: "users",
    protected: true,
    icon: <Icon fontSize="small">account_circle</Icon>, // User-specific icon
    route: "/users",
    component: <UsersTable />,
  },
  {
    type: "collapse",
    name: "Clubs",
    key: "clubs",
    protected: true,
    icon: <Icon fontSize="small">group_work</Icon>, // Icon representing groups or clubs
    route: "/clubs",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Universities",
    key: "universities",
    protected: true,
    icon: <Icon fontSize="small">school</Icon>, // Icon representing educational institutions
    route: "/universities",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Events",
    key: "events",
    protected: true,
    icon: <Icon fontSize="small">event</Icon>, // Calendar or event-specific icon
    route: "/events",
    component: <Dashboard />,
  },

  // {
  //   type: "collapse",
  //   name: "Upload",
  //   key: "upload",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },
  // {
  //   type: "collapse",
  //   name: "Users",
  //   key: "users",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    protected: false,
    component: <SignIn />,

  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    protected: false,
    component: <SignUp />,
  },
];

export default routes;
