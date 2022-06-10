import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { makeStyles } from "@mui/styles";

// components
import TaskMain from "src/components/taskAssignment.js/taskMain";
import TaskSidebar from "src/components/taskAssignment.js/taskSidebar";
import PageHeader from "../components/PageHeader";

const useStyles = makeStyles((theme) => ({
  root: {
    maxHeight: "70vh",
    height: "70vh",
    width: "100%",
    margin: "auto",
    display: "flex",
    gridTemplateColumns: "30% 70%",
    justifyContent: "space-around",
    backgroundColor: "#fdfdff",
  },
}));
// lg: '70%', md: '90%'

export default function TaskAssignment() {
  const classes = useStyles();
  return (
    <Box
      component="div"
      sx={{ width: "95%", margin: "auto", maxHeight: "70vh", height: "70vh" }}
    >
      <CssBaseline />
      <PageHeader title="Tasks" />

      <div className={classes.root}>
        <TaskSidebar />
      </div>
    </Box>
  );
}
