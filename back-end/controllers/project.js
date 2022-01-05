import Client from "../models/client.js";
import Project from "../models/project.js";
import Team from "../models/team.js";
import User from "../models/user.js";
import asyncHandler from "express-async-handler";

// @desc    Create a new project
// @route   POST /project
// @access  Private

const createProject = asyncHandler(async (req, res) => {
  const manager = req.user;
  if (manager.role === "manager") {
    const { name, clientId } = req.body;
    try {
      const project = new Project({ name });
      project.employees.push(manager._id.toHexString());
      project.createdBy = manager._id;
      const client = await Client.findById(clientId);
      if (!client) throw new Error('Client not found');
      manager.projects.push(project._id.toHexString());
      await manager.save();

      await project.save();
      client.projects.push(project._id.toHexString());
      await client.save();
      project.client = clientId;
      await project.save();
      res.status(201).json({
        messsage: "Successfully Created Project",
        data: project,
      });
    } catch (error) {
      res.status(500);
      throw new Error(error);
    }
  } else {
    res.status(401);
    throw new Error("Unauthorized manager");
  }
});

// @desc    Get project
// @route   GET /project
// @access  Public

const getProject = asyncHandler(async (req, res) => {
  const responseArray = [];
  const user = req.user;

  if (!user) {
    res.status(401);
    throw new Error("Unauthorized");
  }

  for (let i = 0; i < user.projects.length; i++) {
    const project = await Project.findById(user.projects[i]);
    if (project) {
      await Project.populate(project, {
        path: "members",
      });
      responseArray.push(project);
    } else {
      continue;
    }
  }
  res.json({
    msg: "Success",
    data: responseArray,
  });
});

// @desc    Get project by id
// @route   GET /project/:id
// @access  Private

const getProjectById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const project = await Project.findById(id);
    if (!project) {
      res.status(404);
      throw new Error("No projects found");
    }
    res.status(200).json({
      project,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

// @desc    Edit project
// @route   PATCH /project
// @access  Private

const editProject = asyncHandler(async (req, res) => {
  const employee = req.user;
  if (employee.role === "manager") {
    const projectId = req.params.id;

    try {
      const project = await Project.findByIdAndUpdate(projectId, req.body);
      if (!project) {
        res.status(404);
        throw new Error(`No project found ${projectId}`);
      }

      res.status(202).json({
        messsage: "Successfully edited project",
        data: project,
      });
    } catch (error) {
      res.status(500);
      throw new Error(error);
    }
  } else {
    res.status(401);
    throw new Error("Unauthorized manager");
  }
});

// @desc    Delete a project
// @route   DELETE /project
// @access  Private

const deleteProject = asyncHandler(async (req, res) => {
  const employee = req.user;
  if (employee.role === "manager") {
    const { projectId } = req.body;
    try {
      // delete project itself
      const project = await Project.findByIdAndRemove(projectId);
      // const project = await Project.findById(projectId);
      if (!project) {
        res.status(404);
        throw new Error(`No project found ${projectId}`);
      }
      const clientId = project.client;
      const client = Client.findById(clientId);
      if (client) {
        client.projects.forEach((project, index) => {
          if (project.equals(projectId)) {
            client.projects.splice(index, 1);
          }

        });
      }
      await client.save();
      for (let i = 0; i < project.employees.length; i++) {
        const user = User.findById(project.employees[i]);
        user.projects.forEach((project, index) => {
          if (project.equals(projectId)) {
            user.projects.splice(index, 1);
          }
        });
        user.save();
      }

      // delete project from client
      {
        const client = await Client.findById(project.client.toHexString());
        if (!client) {
          throw new Error('Client not found');
        }
        client.projects = client.projects.filter(
          (id) => id.toHexString() !== projectId
        );
        await client.save();
      }

      // delete project from employees array
      if (project.employees.length === 0) {
        throw new Error('No employee in projects');
      }
      project.createdBy;
      for (let i = 0; i < project.employees.length; i++) {
        const emp = await User.findById(project.employees[i]);
        if (!emp) throw new Error(`Employee ${project.employees[i]} not found`);
        emp.projects = emp.projects.filter(
          (id) => id.toHexString() !== projectId
        );
        console.log(emp.projects);
        await emp.save();
      }

      res.status(202).json({
        messsage: 'Successfully Deleted Project',
        status: 'success',
        data: employee.projects,
      });
    } catch (error) {
      res.status(500);
      throw new Error(error);
    }
  } else {
    res.status(401);
    throw new Error("Unauthorized manager");
  }
});

// @desc    Add team to project
// @route   PATCH /project
// @access  Private

const projectTeam = asyncHandler(async (req, res) => {
  const employee = req.user;
  if (employee.role === "manager") {
    const { teamId, projectId } = req.body;
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        res.status(404);
        throw new Error(`No project found ${projectId}`);
      }

      const team = await Team.findById(teamId).populate("employees");
      if (!team) {
        res.status(404);
        throw new Error(`No team found ${teamId}`);
      }

      for (let i = 0; i < team.employees.length; i++) {
        let emp = team.employees[i];

        emp.projects.push(projectId);
        await emp.save();
      }

      project.team.push(teamId);
      team.projects.push(projectId);
      await project.save();
      await team.save();
      res.status(201).json({
        messsage: "Successfully Added team to  Project",
        data: project,
      });
    } catch (error) {
      res.status(500);
      throw new Error(error);
    }
  } else {
    res.status(401);
    throw new Error("Unauthorized manager");
  }
});

export {
  createProject,
  deleteProject,
  editProject,
  getProjectById,
  getProject,
  projectTeam,
};
