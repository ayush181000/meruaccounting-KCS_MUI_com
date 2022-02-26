import mongoose from "mongoose";
// models
import Activity from "../models/activity.js";
import User from "../models/user.js";
import Project from "../models/project.js";
import Reports from "../models/reports.js";
// utils
import asyncHandler from "express-async-handler";
import dayjs from "dayjs";
import moment from "moment";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// @desc    Generate Report
// @route   GET /report
// @access  Private

const generateReport = asyncHandler(async (req, res) => {
  try {
    let { clientIds, projectIds, userIds, dateOne, dateTwo, groupBy } =
      req.body;

    if (projectIds) {
      projectIds = projectIds.map((id) => {
        return mongoose.Types.ObjectId(id._id);
      });
    }
    if (userIds) {
      userIds = userIds.map((id) => {
        return mongoose.Types.ObjectId(id._id);
      });
    }
    if (clientIds) {
      clientIds = clientIds.map((id) => {
        return mongoose.Types.ObjectId(id._id);
      });
    }

    console.log(clientIds, projectIds, userIds, dateOne, dateTwo);

    if (!dateOne) dateOne = dayjs(-1).format("DD/MM/YYYY");
    if (!dateTwo) dateTwo = dayjs().format("DD/MM/YYYY");

    // let user;
    // if (userId) user = await User.findById(userId);
    // else user = req.user;

    const activity = await Activity.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $cond: [
                  projectIds,
                  {
                    $in: ["$project", projectIds],
                  },
                  { $not: { $in: ["$project", []] } },
                ],
              },
              {
                $cond: [
                  clientIds,
                  {
                    $in: ["$client", clientIds],
                  },
                  { $not: { $in: ["$client", []] } },
                ],
              },
              {
                $cond: [
                  userIds,
                  {
                    $in: ["$employee", userIds],
                  },
                  { $not: { $in: ["$employee", []] } },
                ],
              },
              {
                $and: [
                  {
                    $ne: ["$activityOn", ""],
                  },
                  {
                    $ne: ["$activityOn", "null"],
                  },
                  {
                    $ne: ["$activityOn", null],
                  },
                  {
                    $gte: [
                      {
                        $dateFromString: {
                          dateString: "$activityOn",
                          format: "%d/%m/%Y",
                          onNull: new Date(0),
                        },
                      },
                      {
                        $dateFromString: {
                          dateString: dateOne,
                          format: "%d/%m/%Y",
                          onNull: new Date(0),
                        },
                      },
                    ],
                  },
                  {
                    $lte: [
                      {
                        $dateFromString: {
                          dateString: "$activityOn",
                          format: "%d/%m/%Y",
                        },
                      },
                      {
                        $dateFromString: {
                          dateString: dateTwo,
                          format: "%d/%m/%Y",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $facet: {
          byProjects: [
            {
              $lookup: {
                from: "projects",
                localField: "project",
                foreignField: "_id",
                as: "project",
              },
            },
            {
              $unwind: {
                path: "$project",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: {
                  name: "$project.name",
                  _id: "$project._id",
                },
                internal: {
                  $sum: { $cond: ["$isInternal", "$consumeTime", 0] },
                },
                external: {
                  $sum: { $cond: ["$isInternal", 0, "$consumeTime"] },
                },
                actCount: {
                  $sum: 1,
                },
                totalHours: {
                  $sum: "$consumeTime",
                },
                avgPerformanceData: {
                  $avg: "$performanceData",
                },
              },
            },
          ],
          byClients: [
            {
              $lookup: {
                from: "clients",
                localField: "client",
                foreignField: "_id",
                as: "client",
              },
            },
            {
              $unwind: {
                path: "$client",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: {
                  firstName: "$client.name",
                  _id: "$client._id",
                },
                internal: {
                  $sum: { $cond: ["$isInternal", "$consumeTime", 0] },
                },
                external: {
                  $sum: { $cond: ["$isInternal", 0, "$consumeTime"] },
                },
                actCount: {
                  $sum: 1,
                },
                totalHours: {
                  $sum: "$consumeTime",
                },
                avgPerformanceData: {
                  $avg: "$performanceData",
                },
              },
            },
          ],
          byEmployees: [
            {
              $lookup: {
                from: "users",
                localField: "employee",
                foreignField: "_id",
                as: "employee",
              },
            },
            {
              $unwind: {
                path: "$employee",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $group: {
                _id: {
                  firstName: "$employee.firstName",
                  employee: "$employee._id",
                  lastName: "$employee.lastName",
                },
                internal: {
                  $sum: { $cond: ["$isInternal", "$consumeTime", 0] },
                },
                external: {
                  $sum: { $cond: ["$isInternal", 0, "$consumeTime"] },
                },
                actCount: {
                  $sum: 1,
                },
                totalHours: {
                  $sum: "$consumeTime",
                },
                avgPerformanceData: {
                  $avg: "$performanceData",
                },
              },
            },
          ],
          byScreenshots: [
            {
              $lookup: {
                from: "screenshots",
                localField: "screenshots",
                foreignField: "_id",
                as: "screenshots",
              },
            },
            {
              $unwind: {
                path: "$screenshots",
              },
            },
            {
              $group: {
                _id: "$screenshots.title",
                internal: {
                  $sum: { $cond: ["$isInternal", "$consumeTime", 0] },
                },
                external: {
                  $sum: { $cond: ["$isInternal", 0, "$consumeTime"] },
                },
                actCount: {
                  $sum: 1,
                },
                totalHours: {
                  $sum: "$consumeTime",
                },
                avgPerformanceData: {
                  $avg: "$performanceData",
                },
              },
            },
          ],
          byEP: [
            {
              $lookup: {
                from: "users",
                localField: "employee",
                foreignField: "_id",
                as: "employee",
              },
            },
            {
              $unwind: {
                path: "$employee",
              },
            },
            {
              $group: {
                _id: {
                  userId: "$employee._id",
                  firstName: "$employee.firstName",
                  lastName: "$employee.lastName",
                  project: "$project",
                  client: "$client",
                },
                actCount: {
                  $sum: 1,
                },
                totalHours: {
                  $sum: "$consumeTime",
                },
                avgPerformanceData: {
                  $avg: "$performanceData",
                },
              },
            },
            {
              $lookup: {
                from: "projects",
                localField: "_id.project",
                foreignField: "_id",
                as: "project",
              },
            },
            {
              $lookup: {
                from: "clients",
                localField: "_id.client",
                foreignField: "_id",
                as: "client",
              },
            },
            {
              $unwind: {
                path: "$client",
              },
            },
            {
              $unwind: {
                path: "$project",
              },
            },
            {
              $group: {
                _id: {
                  userId: "$_id.userId",
                  firstName: "$_id.firstName",
                  lastName: "$_id.lastName",
                },
                projects: {
                  $push: {
                    client: "$client.name",
                    project: "$project.name",
                    count: "$actCount",
                    totalHours: "$totalHours",
                    avgPerformanceData: "$performanceData",
                  },
                },
              },
            },
          ],
          byDates: [
            {
              $group: {
                _id: "$activityOn",
                internal: {
                  $sum: { $cond: ["$isInternal", "$consumeTime", 0] },
                },
                external: {
                  $sum: { $cond: ["$isInternal", 0, "$consumeTime"] },
                },
                actCount: { $sum: 1 },
                totalHours: { $sum: "$consumeTime" },
                avgPerformanceData: { $avg: "$performanceData" },
              },
            },
          ],
          total: [
            {
              $group: {
                _id: null,
                internal: {
                  $sum: { $cond: ["$isInternal", "$consumeTime", 0] },
                },
                external: {
                  $sum: { $cond: ["$isInternal", 0, "$consumeTime"] },
                },
                actCount: { $sum: 1 },

                totalHours: { $sum: "$consumeTime" },
                avgPerformanceData: { $avg: "$performanceData" },
              },
            },
          ],
        },
      },
    ]);

    res.json({
      status: "ok",
      data: activity,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// @desc    Save Report
// @route   POST /report/save
// @access  Private
const saveReports = asyncHandler(async (req, res) => {
  try {
    let {
      url,
      reports,
      name,
      includeSS,
      includeAL,
      includePR,
      includeApps,
      options,
    } = req.body;
    let userId = req.user._id;
    console.log(reports);
    let fileName = userId + "-" + new Date().getTime();

    // STEP : Writing to a file
    fs.writeFileSync(
      `./saved reports/${fileName}.json`,
      JSON.stringify(reports)
    );

    // make a new document for reports schema
    const saved = await Reports.create({
      options,
      user: userId,
      url,
      includeSS,
      includeAL,
      includePR,
      includeApps,
      name,
      fileName,
    });

    res.json({
      status: "Report saved",
      data: saved,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// @desc    Fetch Report
// @route   POST /report/fetch
// @access  Private
const fetchReports = asyncHandler(async (req, res) => {
  try {
    let { url } = req.body;

    const report = await Reports.find({ url: url });

    console.log(report[0].fileName);

    // Read users.json file
    let data = JSON.parse(
      fs.readFileSync(`./saved reports/${report[0].fileName}.json`, "utf8")
    );

    res.json({
      status: "Report fetched",
      report: data,
      data: report,
    });
  } catch (error) {
    throw new Error(error);
  }
});

export { generateReport, saveReports, fetchReports };
