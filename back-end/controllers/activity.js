import Activity from "../models/activity.js";
import User from "../models/user.js";
import Screenshot from "../models/screenshot.js";
import asyncHandler from "express-async-handler";

// @desc    Add a new screenshot
// @route   POST /activity/screenshot
// @access  Private

//TODO: not tested

const createScreenShot = asyncHandler(async (req, res) => {
  const {
    projectId,
    task,
    image,
    activityAt,
    activityId,
    performanceData,
    title,
  } = req.body;

  const screenshot = await Screenshot.create({
    employee: req.user._id,
    project: projectId,
    task,
    image,
    activityat: activityAt,
    activityId,
    performanceData,
    title,
  });

  if (screenshot) {
    const activity = Activity.findById(activityId);
    activity.screenshots.push(screenshot._id.toHexString());
    await activity.save();

    res.status(201).json({
      status: "success",
      screenshot,
      activity,
    });
  }
});

// @desc    Add a new activity
// @route   POST /activity
// @access  Private

const createActivity = asyncHandler(async (req, res) => {
  const {
    // clientId,
    task,
    startTime,
    endTime,
    performanceData,
    isInternal,
  } = req.body;

  const activity = await Activity.create({
    // client: clientId,
    task,
    performanceData,
    startTime,
    endTime,
    isInternal,
  });

  if (activity) {
    const user = await User.findById(req.user._id);
    let actAt = new Date(startTime);
    let dd = actAt.getDate();
    let mm = actAt.getMonth() + 1;
    let yyyy = actAt.getFullYear();
    let today = dd + "/" + mm + "/" + yyyy;
    let found = false;
    for (let i = 0; i < user.days.length; i++) {
      const day = user.days[i];
      if (day.date == today) {
        console.log("Inside Date Equals");
        found = true;
        day.activities.push(activity);
        break;
      } else {
        console.log("not found");
      }
    }
    if (found == false) {
      const day = {
        date: today,
        activities: [activity],
      };
      user.days.push(day);
    }
    await user.save();
    res.status(201).json({
      status: "success",
      activity,
      days: user.days,
    });
  } else {
    res.status(500);
    throw new Error("Internal server error");
  }
});

// @desc    Update the activity
// @route   PATCH /activity/:id
// @access  Private

const updateActivity = asyncHandler(async (req, res) => {
  try {
    const activityId = req.params.id;
    const unUpdatedactivity = await Activity.findByIdAndUpdate(activityId, {
      $set: req.body,
    });
    const activity = await Activity.findById(activityId);

    if (!unUpdatedactivity) {
      res.status(404);
      throw new Error(`No activity found ${activityId}`);
    }

    res.status(202).json({
      message: "Succesfully edited activity",
      data: activity,
    });
  } catch (error) {
    throw new Error(error);
  }
});

export { createActivity, createScreenShot, updateActivity };
