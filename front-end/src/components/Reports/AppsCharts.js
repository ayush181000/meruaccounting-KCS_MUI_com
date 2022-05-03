import React, { useState, useEffect } from "react";
import { Pie } from "@ant-design/plots";
import { reportsContext } from "../../contexts/ReportsContext";
import secondsToHms from "../../_helpers/secondsToHms";
import { Box, Typography } from "@mui/material";
import { loginContext } from "src/contexts/LoginContext";
import { Role } from "../../_helpers/role";

export default function AppsCharts() {
  const { reports } = React.useContext(reportsContext);
  const [chartData, setchartData] = useState([]);
  const [totalHours, settotalHours] = useState(null);
  const [totalActCount, settotalCount] = useState(null);
  const [totalPData, settotalPData] = useState(null);
  const [totalPRate, settotalPRate] = useState(null);

  const { loginC } = React.useContext(loginContext);

  useEffect(() => {
    let t = 0;
    reports.reports[0].byScreenshots.forEach((ss) => {
      t = t + ss.actCount;
    });
    let arr = reports.reports[0].byScreenshots.map((ss) => {
      let o = {
        type: `${ss._id}`,
        value: ss.actCount,
      };
      return o;
    });
    setchartData(arr);
    settotalHours(reports?.reports[0]?.total[0]?.totalHours);
    settotalPData(reports?.reports[0]?.total[0]?.avgPerformanceData);
    settotalCount(reports?.reports[0]?.total[0]?.actCount);
    settotalPRate(reports?.reports[0]?.total[0]?.avgPayRate);
  }, [reports]);
  const config = {
    width: 1000,
    data: chartData,
    angleField: "value",
    colorField: "type",
    radius: 0.75,
    label: {
      formatter: (datum) => {
        return `${datum.type}`;
      },
      autoHide: true,
      type: "spider",
      labelHeight: 28,
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.type,
          value: Math.trunc((datum.value * 100) / totalActCount) + "%",
        };
      },
    },
    interactions: [
      {
        type: "element-selected",
      },
      {
        type: "element-active",
      },
    ],
  };
  return (
    <Box>
      <Box sx={{}}>
        <Typography variant="h2" sx={{ opacity: 1, textAlign: "left" }}>
          Apps Reports
        </Typography>
      </Box>
      <Box>
        <Box>
          <Typography variant="h3" sx={{ opacity: 0.6, textAlign: "left" }}>
            {secondsToHms(totalHours)}
          </Typography>
          <Typography variant="h4" sx={{ opacity: 0.6, textAlign: "left" }}>
            {Math.trunc(totalPData)}%
          </Typography>
          {Role.indexOf(loginC.userData.role) <= 1 ? (
            <Typography variant="h4" sx={{ opacity: 0.6, textAlign: "left" }}>
              {Math.trunc((totalPRate * totalHours) / 3600)}{" "}
              <span>&#8377;</span>
            </Typography>
          ) : (
            ""
          )}
        </Box>
        <div>
          <Pie style={{ flexGrow: "2" }} {...config} />
        </div>
      </Box>
    </Box>
  );
}
