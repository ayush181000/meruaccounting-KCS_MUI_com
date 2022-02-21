import * as React from "react";
import PropTypes from "prop-types";
import { Tabs } from "@mui/material";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import DatePicker from "./DatePicker";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
// components
import Graphs from "./Graphs";
import SelectEmployees from "./SelectEmployees";
import SelectProjects from "./SelectProjects";
import SelectClients from "./SelectClients";
import SaveReport from "./SaveReport";

// contexts and apis
import { teamContext } from "../../contexts/TeamsContext";
import { ClientsContext } from "../../contexts/ClientsContext";
import { reportsContext } from "../../contexts/ReportsContext";
import { getReports } from "../../api/reports api/reports";
// import RowData from "./Datagrid";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

//////////////////////////panelllllll
export default function Main() {
  // tab panels value
  const [value, setValue] = React.useState(0);
  //
  const { getTeams } = React.useContext(teamContext);
  //
  const { clientDetails } = React.useContext(ClientsContext);
  //
  const { reports, dispatchGetReports } = React.useContext(reportsContext);

  // variable for date, employees, and projects
  const [date, setdate] = React.useState(null);
  const [employeeOptions, setemployeeOptions] = React.useState([]);
  const [projectOptions, setprojectOptions] = React.useState([]);
  const [clientOptions, setclientOptions] = React.useState([]);
  const [employees, setemployees] = React.useState([]);
  const [projects, setprojects] = React.useState([]);
  const [clients, setclients] = React.useState([]);

  // tab panels value
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleReportClick = async () => {
    const dateOne = date ? date[0].format("DD/MM/YYYY") : null;
    const dateTwo = date ? date[1].format("DD/MM/YYYY") : null;
    const userIds = employees.length ? employees : null;
    const projectIds = projects.length ? projects : null;
    const clientIds = clients.length ? clients : null;
    const options = {
      clientIds,
      projectIds,
      userIds,
      dateOne,
      dateTwo,
    };
    console.log(options);
    getReports(dispatchGetReports, options);
    console.log(reports);
  };

  //   make select employee options

  //   make select project options

  //   make select client options

  return (
    <Box sx={{ width: "100%" }}>
      {true ? <Graphs style={{ margin: 10 }}></Graphs> : null}
      {/* </TabPanel> */}
      {/* <RowData /> */}
    </Box>
  );
}