import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { firebaseApp } from "../../../firebase.js";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PostModal from "../Posts";

const db = getFirestore(firebaseApp);

const ClubsTable = () => {
  const [users, setUsers] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "Clubs");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setEditedData({ ClubUniversity: user.ClubUniversity, ClubName: user.ClubName });
    setEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "Clubs", currentUser.id), editedData);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === currentUser.id ? { ...user, ...editedData } : user
        )
      );
      setEditDialogOpen(false);
      setCurrentUser(null);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "Clubs", userId));
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        alert("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);

  const handleOpenModal = (id) => {
    setSelectedClubId(id); // Set the clubId dynamically
    setModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setModalOpen(false); // Close the modal
    setSelectedClubId(null); // Reset the clubId
  };

  return (
    <MDBox pt={6} pb={3} pl={40}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h6" color="white">
                Club Management
              </MDTypography>
            </MDBox>
            <MDBox p={3}>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <strong>Profile</strong>
                      </TableCell>
                      <TableCell>
                        <strong>ID</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Club University</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Club Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <img
                            src={user.ClubLogo}
                            alt=""
                            style={{ width: "50px", height: "50px" }}
                          />
                        </TableCell>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.ClubUniversity}</TableCell>
                        <TableCell>{user.ClubName}</TableCell>
                        <TableCell>
                          <MDButton
                            color="success"
                            size="small"
                            onClick={() => handleEditUser(user)}
                            sx={{ mt: 1 }}
                          >
                            Edit
                          </MDButton>
                          <MDButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{ mt: 1, ml: 2 }}
                          >
                            Delete
                          </MDButton>
                          <MDButton
                            color="warning"
                            size="small"
                            onClick={() => handleOpenModal(user.id)} // Pass user.id dynamically
                            sx={{ mt: 1, ml: 2 }}
                          >
                            Show Posts
                          </MDButton>



                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Modal */}
      {modalOpen && selectedClubId && (
        <PostModal open={modalOpen} onClose={handleCloseModal} clubId={selectedClubId} />
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Club University"
            type="text"
            fullWidth
            value={editedData.ClubUniversity || ""}
            onChange={(e) => setEditedData((prev) => ({ ...prev, ClubUniversity: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Club Name"
            type="text"
            fullWidth
            value={editedData.ClubName || ""}
            onChange={(e) => setEditedData((prev) => ({ ...prev, ClubName: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <MDButton color="info" onClick={() => setEditDialogOpen(false)}>
            Cancel
          </MDButton>
          <MDButton color="success" onClick={handleSaveUser}>
            Save
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
};

export default ClubsTable;
