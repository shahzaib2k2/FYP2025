// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const session = require('express-session');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const bcrypt = require('bcryptjs');
// const mongoose = require('mongoose');
// const connectDB = require('./db');
// const crypto = require('crypto');
// const multer = require('multer');
// const path = require('path');
// const {ethers} = require('ethers');
// const { createTaskOnChain } = require('./ethers');
// const fs = require('fs');
// const nodemailer = require('nodemailer');
// const User = require('./users');
// const Task = require('./Tasks');
// const File = require('./files_metadata');
// const Agenda = require('./agenda');
// const Invitation = require('./members')

// // Connect to database
// connectDB();

// const app = express();
// const port = 3000;

// const contractABI = require('./artifacts/contracts/TaskManager.sol/TaskManager.json').abi;
// const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// // ========== Middleware ==========
// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']  // Explicit methods
// }));


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({
//   secret: 'uwuugjernguergungufdngusdfgnsudfgnds',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     secure: false,
//     maxAge: 24 * 60 * 60 * 1000
//   }
// }));
// app.use(passport.initialize());
// app.use(passport.session());

// // ========== Google OAuth ==========
// const GOOGLE_CLIENT_ID = '672159425581-bldvjkf8k49hl05ssd9bucs0prequu6i.apps.googleusercontent.com';
// const GOOGLE_CLIENT_SECRET = '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';

// passport.use(new GoogleStrategy({
//   clientID: GOOGLE_CLIENT_ID,
//   clientSecret: GOOGLE_CLIENT_SECRET,
//   callbackURL: '/auth/google/callback'
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     const email = profile.emails[0].value;
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         full_name: profile.displayName,
//         email,
//         password: crypto.randomBytes(32).toString('hex'),
//         authType: 'google'
//       });
//     }

//     return done(null, { id: user._id, email: user.email, name: user.full_name });
//   } catch (err) {
//     return done(err);
//   }
// }));

// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: 'hassan.pink123@gmail.com',
//     pass: 'rcbi eunf yahp ztga'
//   }
// });

// transporter.verify((error, success) => {
//   if (error) {
//     console.error('❌ Nodemailer configuration error:', error);
//   } else {
//     console.log('✅ Nodemailer ready to send emails');
//   }
// });


// passport.serializeUser((user, done) => done(null, user));
// passport.deserializeUser((user, done) => done(null, user));

// // ========== Auth Routes ==========
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
//     req.session.user = { id: user._id, email: user.email, name: user.full_name };
//     res.json({ success: true, message: 'Login successful' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error during login' });
//   }
// });

// app.post('/signup', async (req, res) => {
//   const { full_name, email, password } = req.body;
//   try {
//     if (await User.findOne({ email })) {
//       return res.status(409).json({ success: false, message: 'Email already in use' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ full_name, email, password: hashedPassword, authType: 'local' });
//     await user.save();
//     res.status(201).json({ success: true, message: 'Signup successful' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error during signup' });
//   }
// });

// app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
//   (req, res) => {
//     req.session.user = req.user;
//     req.session.save(() => res.redirect('http://localhost:5173/dashboard'));
//   }
// );

// app.get('/auth/user', (req, res) => {
//   if (req.session.user) {
//     res.json({ loggedIn: true, user: req.session.user });
//   } else {
//     res.json({ loggedIn: false });
//   }
// });

// app.post('/logout', (req, res) => {
//   req.session.destroy(() => {
//     res.clearCookie('connect.sid');
//     res.json({ success: true });
//   });
// });

// // ========== File Upload Configuration ==========
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const allowedTypes = [
//   'image/jpeg',
//   'image/png',
//   'image/gif',
//   'application/pdf',
//   'application/zip',
//   'application/x-rar-compressed',
//   'text/plain',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
// ];

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type'), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100 MB
//     files: 10
//   }
// });

// // Serve static files from /uploads for access via /uploads/filename
// app.use('/uploads', express.static(uploadDir));

// // ========== File Upload Route ==========

// app.post('/api/files', upload.array('files'), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No files were uploaded',
//       });
//     }

//     const uploadedFiles = await Promise.all(req.files.map(async (file) => {
//       const newFile = new File({
//         name: file.originalname,
//         size: file.size,
//         path: file.path,
//         type: file.mimetype,
//         extension: path.extname(file.originalname).substring(1),
//         uploadedAt: new Date(),
//         uploader: req.session?.user?.id || 'anonymous', // Optional: Add user info if authenticated
//       });
//       await newFile.save();

//       return {
//         _id: newFile._id,
//         name: newFile.name,
//         size: newFile.size,
//         url: `/uploads/${path.basename(file.path)}`,
//         downloadUrl: `/api/files/${newFile._id}/download`,
//         uploadedAt: newFile.uploadedAt,
//       };
//     }));

//     res.status(201).json({
//       success: true,
//       message: 'Files uploaded successfully',
//       files: uploadedFiles,
//     });
//   } catch (error) {
//     console.error('File save error:', error);
//     req.files?.forEach(file => {
//       if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//     });
//     res.status(500).json({
//       success: false,
//       message: 'File processing failed',
//       error: error.message,
//     });
//   }
// });

// // Get All Files
// app.get('/api/files', async (req, res) => {
//   try {
//     const { search } = req.query;
//     const query = search ? { name: { $regex: search, $options: 'i' } } : {};

//     const files = await File.find(query).sort({ uploadedAt: -1 });
//     const filesWithUrls = files.map(file => ({
//       _id: file._id,
//       name: file.name,
//       size: file.size,
//       type: file.type,
//       extension: file.extension,
//       uploadedAt: file.uploadedAt,
//       url: `/uploads/${path.basename(file.path)}`,
//       downloadUrl: `/api/files/${file._id}/download`,
//     }));

//     res.json({ success: true, data: filesWithUrls });
//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch files',
//       error: error.message,
//     });
//   }
// });

// // Download File
// app.get('/api/files/:id/download', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ message: 'Invalid file ID' });
//     }

//     const file = await File.findById(req.params.id);
//     if (!file) {
//       return res.status(404).json({ message: 'File not found' });
//     }

//     if (!fs.existsSync(file.path)) {
//       return res.status(404).json({ message: 'File not found on server' });
//     }

//     res.download(file.path, file.name);
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Failed to download file',
//       error: error.message,
//     });
//   }
// });

// // Delete File
// app.delete('/api/files/:id', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ message: 'Invalid file ID' });
//     }

//     const file = await File.findByIdAndDelete(req.params.id);
//     if (!file) {
//       return res.status(404).json({ message: 'File not found' });
//     }

//     if (fs.existsSync(file.path)) {
//       fs.unlinkSync(file.path);
//     }

//     res.json({ 
//       success: true, 
//       message: 'File deleted successfully',
//     });
//   } catch (error) {
//     res.status(500).json({ 
//       message: 'Failed to delete file',
//       error: error.message,
//     });
//   }
// });








// // ========== TASKS ROUTES ==========

// // Bchain 
// // POST create task
// app.post("/createTask", async (req, res) => {
//   const { content } = req.body;
//   console.log("Creating task on chain with content:", content);

//   try {
//     const txHash = await createTaskOnChain(content);
//     console.log("✅ Task created on chain. Tx hash:", txHash);
//     res.json({ success: true, txHash });
//   } catch (err) {
//     console.error("❌ Error creating task on chain:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// // app.put("/updateTask/:taskId", async (req, res) => {
// //   const { taskId } = req.params;
// //   const { 
// //     newContent,
// //     action = "updated",  // Default action
// //     details = ""        // Default details
// //   } = req.body;

// //   try {
// //     // 1. Get signer from authenticated session
// //     const signer = getSignerFromAuth(req); // Implement your auth logic

// //     // 2. Send transaction with update metadata
// //     const tx = await tasksContract
// //       .connect(signer)
// //       .updateTaskWithDetails(
// //         taskId,
// //         newContent,
// //         action,  // "updated", "status_changed", etc.
// //         details // JSON string with update details
// //       );

// //     const receipt = await tx.wait();

// //     // 3. Get the recorded update from blockchain
// //     const updateEvents = await tasksContract.queryFilter(
// //       tasksContract.filters.TaskUpdated(taskId),
// //       receipt.blockNumber,
// //       receipt.blockNumber
// //     );

// //     const lastUpdate = updateEvents[0].args;

// //     res.json({
// //       success: true,
// //       taskId,
// //       updater: lastUpdate.updater,
// //       action: lastUpdate.action,
// //       details: lastUpdate.details,
// //       txHash: receipt.transactionHash,
// //       timestamp: new Date(lastUpdate.timestamp * 1000)
// //     });

// //   } catch (err) {
// //     res.status(500).json({
// //       success: false,
// //       error: err.message
// //     });
// //   }
// // });
// // GET all tasks

// app.get('/tasks', async (req, res) => {
//   try {
//     const tasks = await Task.find();
//     res.json({ success: true, data: tasks });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
//   }
// });

// // GET single task
// app.get('/tasks/:id', async (req, res) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     return res.status(400).json({ success: false, error: 'Invalid task ID' });
//   }

//   try {
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
//     res.json({ success: true, data: task });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Failed to fetch task' });
//   }
// });

// // POST create task
// app.post('/tasks', async (req, res) => {
//   try {
//     const { title, content, project, status, assignee, dueDate, priority, txHash } = req.body;
//     const task = new Task({
//       title: title || content,
//       project,
//       status: status || 'To Do',
//       assignee,
//       dueDate: dueDate ? new Date(dueDate) : new Date(),
//       priority: priority,
//       txHash,
//       createdAt: new Date(),
//       lastUpdated: new Date()
//     });
//     await task.save();
//     res.status(201).json({ success: true, data: task });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Failed to create task' });
//   }
// });

// // PATCH update task
// app.patch('/tasks/:id', async (req, res) => {
//   try {
//     const updates = { ...req.body, lastUpdated: new Date() };
//     const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
//     if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
//     res.json({ success: true, data: task });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Failed to update task' });
//   }
// });

// // PATCH task status only
// app.patch('/tasks/:id/status', async (req, res) => {
//   try {
//     const task = await Task.findByIdAndUpdate(
//       req.params.id,
//       { status: req.body.status, lastUpdated: new Date() },
//       { new: true }
//     );
//     if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
//     res.json({ success: true, data: task });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Failed to update status' });
//   }
// });

// // PATCH bulk update
// app.patch('/tasks/bulk-update', async (req, res) => {
//   const { taskIds, updates } = req.body;
//   try {
//     const result = await Task.updateMany(
//       { _id: { $in: taskIds } },
//       { $set: { ...updates, lastUpdated: new Date() } }
//     );
//     res.json({ success: true, data: result });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Bulk update failed' });
//   }
// });

// // DELETE task
// app.delete('/tasks/:id', async (req, res) => {
//   try {
//     const deleted = await Task.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
//     res.json({ success: true, message: 'Task deleted' });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Failed to delete task' });
//   }
// });


// app.get('/api/analytics-data', async (req, res) => {
//   try {
//     const tasks = await Task.find();
//     const statusCounts = tasks.reduce((acc, task) => {
//       acc[task.status] = (acc[task.status] || 0) + 1;
//       return acc;
//     }, {});
//     const priorityCounts = tasks.reduce((acc, task) => {
//       acc[task.priority] = (acc[task.priority] || 0) + 1;
//       return acc;
//     }, {});
//     res.json({ success: true, data: { statusCounts, priorityCounts } });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
//   }
// });
// // ========== Invitation ==========

// app.post('/api/send-invites', async (req, res) => {
//   const { emails, role = 'member', name } = req.body;

//   if (!Array.isArray(emails)) {
//     return res.status(400).json({ success: false, message: 'Emails must be an array', failedCount: 0, successfulInvites: [], failedInvites: [] });
//   }
//   if (emails.length === 0) {
//     return res.status(400).json({ success: false, message: 'At least one email required', failedCount: 0, successfulInvites: [], failedInvites: [] });
//   }
//   if (!name || typeof name !== 'string' || !name.trim()) {
//     return res.status(400).json({ success: false, message: 'Name is required', failedCount: 0, successfulInvites: [], failedInvites: [] });
//   }

//   try {
//     const successfulInvites = [];
//     const failedInvites = [];

//     for (const email of emails) {
//       try {
//         if (!/^\S+@\S+\.\S+$/.test(email)) {
//           failedInvites.push({ email, error: 'Invalid email format' });
//           continue;
//         }
//         const token = crypto.randomBytes(16).toString('hex');
//         await Invitation.create({
//           email,
//           name,
//           role,
//           token,
//           expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
//           createdAt: new Date(),
//         });
//         const acceptanceLink = `http://localhost:5173/accept-invite?token=${token}`;
//         await transporter.sendMail({
//           from: '"AI Smart Task Chain" <hassan.pink123@gmail.com>',
//           to: email,
//           subject: `You've been invited to join as ${role}`,
//           html: `
//             <p>Hello,</p>
//             <p>${name} has invited you to join as a ${role}.</p>
//             <p>Please click the link below to accept the invitation and set up your account:</p>
//             <p><a href="${acceptanceLink}">${acceptanceLink}</a></p>
//             <p>This link will expire in 14 days.</p>
//             <p>If you did not expect this invitation, please ignore this email.</p>
//           `,
//         });
//         console.log(`✅ Email sent to ${email}`);
//         successfulInvites.push(email);
//       } catch (err) {
//         console.error(`❌ Error processing invitation for ${email}:`, err);
//         failedInvites.push({ email, error: err.message });
//       }
//     }

//     res.json({
//       success: successfulInvites.length > 0,
//       successfulInvites,
//       failedCount: failedInvites.length,
//       failedInvites,
//     });
//   } catch (err) {
//     console.error('❌ Send invites error:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       failedCount: 0,
//       successfulInvites: [],
//       failedInvites: [],
//       error: err.message
//     });
//   }
// });

// app.get('/api/team/invitations', async (req, res) => {
//   try {
//     const invitations = await Invitation.find().sort({ createdAt: -1 });
//     res.json({ success: true, data: invitations });
//   } catch (err) {
//     console.error('❌ Fetch invitations error:', err);
//     res.status(500).json({ success: false, message: 'Failed to fetch invitations' });
//   }
// });

// app.post('/api/accept-invite', async (req, res) => {
//   try {
//     const { token, name, password } = req.body;
//     if (!token || !name || !password) {
//       return res.status(400).json({ success: false, message: 'Token, name, and password are required' });
//     }

//     const invitation = await Invitation.findOne({ token });
//     if (!invitation) {
//       return res.status(404).json({ success: false, message: 'Invalid or expired invitation' });
//     }

//     if (invitation.expiresAt < new Date()) {
//       await Invitation.deleteOne({ token });
//       return res.status(410).json({ success: false, message: 'Invitation has expired' });
//     }

//     let user = await User.findOne({ email: invitation.email });
//     if (!user) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user = await User.create({
//         full_name: name,
//         email: invitation.email,
//         password: hashedPassword,
//         authType: 'invited',
//         role: invitation.role,
//       });
//     } else {
//       user.role = invitation.role;
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
//       await user.save();
//     }

//     await Invitation.deleteOne({ token });

//     req.session.user = { id: user._id, email: user.email, name: user.full_name, role: user.role };
//     res.json({ success: true, message: 'Invitation accepted', redirect: '/dashboard' });
//   } catch (err) {
//     console.error('❌ Accept invite error:', err);
//     res.status(500).json({ success: false, message: 'Failed to accept invitation', error: err.message });
//   }
// });

// // ========== AGENDA ROUTES ==========

// // POST: Create new agenda
// app.post('/api/agendas', async (req, res) => {
//   try {
//     const { title, date, time, description, location, participants } = req.body;

//     if (!title || !date) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Title and date are required' 
//       });
//     }

//     const agenda = new Agenda({
//       title,
//       date: new Date(date),
//       time,
//       description,
//       location,
//       participants: participants || [],
//       createdBy: req.session.user.id // Get from session
//     });

//     await agenda.save();
//     res.status(201).json({ 
//       success: true, 
//       message: 'Agenda created successfully',
//       data: agenda 
//     });
//   } catch (err) {
//     console.error('Create agenda error:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: err.message || 'Failed to create agenda' 
//     });
//   }
// });

// // GET: All agendas with optional filtering
// app.get('/api/agendas', async (req, res) => {
//   try {
//     const { search, from, to } = req.query;
//     let query = {};

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

//     if (from && to) {
//       query.date = {
//         $gte: new Date(from),
//         $lte: new Date(to)
//       };
//     }

//     const agendas = await Agenda.find(query)
//       .sort({ date: 1 })
//       .populate('createdBy', 'full_name email');

//     res.json({ 
//       success: true, 
//       data: agendas 
//     });
//   } catch (err) {
//     console.error('Get agendas error:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch agendas' 
//     });
//   }
// });

// // GET: Single agenda
// app.get('/api/agendas/:id', async (req, res) => {
//   try {
//     const agenda = await Agenda.findById(req.params.id)
//       .populate('createdBy', 'full_name email');

//     if (!agenda) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Agenda not found' 
//       });
//     }

//     res.json({ 
//       success: true, 
//       data: agenda 
//     });
//   } catch (err) {
//     console.error('Get agenda error:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to fetch agenda' 
//     });
//   }
// });

// // PATCH: Update agenda
// app.patch('/api/agendas/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     if (updates.date) {
//       updates.date = new Date(updates.date);
//     }

//     const agenda = await Agenda.findByIdAndUpdate(id, updates, { 
//       new: true,
//       runValidators: true 
//     }).populate('createdBy', 'full_name email');

//     if (!agenda) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Agenda not found' 
//       });
//     }

//     res.json({ 
//       success: true, 
//       message: 'Agenda updated successfully',
//       data: agenda 
//     });
//   } catch (err) {
//     console.error('Update agenda error:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: err.message || 'Failed to update agenda' 
//     });
//   }
// });

// // DELETE: Remove agenda
// app.delete('/api/agendas/:id', async (req, res) => {
//   try {
//     const agenda = await Agenda.findByIdAndDelete(req.params.id);

//     if (!agenda) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Agenda not found' 
//       });
//     }

//     res.json({ 
//       success: true, 
//       message: 'Agenda deleted successfully' 
//     });
//   } catch (err) {
//     console.error('Delete agenda error:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Failed to delete agenda' 
//     });
//   }
// });

// // Forgot Password Route (Placeholder)
// app.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;

//   // Validate email
//   if (!email || !email.includes('@')) {
//     return res.status(400).json({ message: 'Please provide a valid email address' });
//   }

//   try {
//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       // Security: Don't reveal if user doesn't exist
//       return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
//     }

//     // Generate reset token
//     const resetToken = crypto.randomBytes(20).toString('hex');
//     const resetTokenExpiry = Date.now() + 3600000; // 1 hour

//     // Save to database
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = resetTokenExpiry;
//     await user.save();

//     // Create reset URL
//     const resetUrl = `${req.headers.origin}/reset-password?token=${resetToken}`;

//     // Email options
//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to: user.email,
//       subject: 'Password Reset Request',
//       html: `
//         <p>You requested a password reset. Click the link below:</p>
//         <a href="${resetUrl}">Reset Password</a>
//         <p>This link will expire in 1 hour.</p>
//         <p>If you didn't request this, please ignore this email.</p>
//       `,
//     };

//     // Send email
//     await transporter.sendMail(mailOptions);

//     res.json({ message: 'Password reset link has been sent to your email.' });
//   } catch (error) {
//     console.error('Password reset error:', error);
//     res.status(500).json({ message: 'Error processing your request. Please try again.' });
//   }
// });

// app.post('/api/reset-password', async (req, res) => {
//   const { token, password, confirmPassword } = req.body; // Changed newPassword to password for consistency

//   // 1. Validate inputs
//   if (!token) {
//     return res.status(400).json({ 
//       success: false,
//       message: 'Reset token is required' 
//     });
//   }

//   if (!password || !confirmPassword) {
//     return res.status(400).json({ 
//       success: false,
//       message: 'Both password fields are required' 
//     });
//   }

//   if (password !== confirmPassword) {
//     return res.status(400).json({ 
//       success: false,
//       message: 'Passwords do not match' 
//     });
//   }

//   if (password.length < 8) {
//     return res.status(400).json({ 
//       success: false,
//       message: 'Password must be at least 8 characters' 
//     });
//   }

//   try {
//     // 2. Find user with valid token
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Password reset token is invalid or has expired. Please request a new reset link.' 
//       });
//     }

//     // 3. Check if new password is different from current
//     const isSamePassword = await bcrypt.compare(password, user.password);
//     if (isSamePassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'New password must be different from current password'
//       });
//     }

//     // 4. Update password and clear reset token
//     const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
//     user.password = await bcrypt.hash(password, salt);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     user.passwordChangedAt = Date.now();

//     await user.save();

//     // 5. Send success response
//     return res.status(200).json({ 
//       success: true,
//       message: 'Password has been reset successfully. You can now login with your new password.',
//       redirect: '/login' // Added redirect path for frontend
//     });

//   } catch (error) {
//     console.error('🔴 Password reset error:', {
//       error: error.message,
//       stack: error.stack,
//       token: token,
//       timestamp: new Date().toISOString()
//     });

//     return res.status(500).json({ 
//       success: false,
//       message: 'An error occurred while resetting your password. Please try again later.' 
//     });
//   }
// });

// // Serve reset password page
// app.get('/reset-password', (req, res) => {
//   const token = req.query.token;
//   if (!token) {
//     return res.status(400).send('Token is required');
//   }
//   res.sendFile(path.join(__dirname, 'public', 'ResetPassword.jsx'));
// });

// // ========== Start Server ==========
// app.listen(port, () => {
//   console.log(`✅ Server running on http://localhost:${port}`);
// });
const cors = require('cors');
const axios = require("axios");
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./db');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const { ethers } = require('ethers');
const { createTaskOnChain, updateTaskOnChain, getBlockchainTasks } = require('./ethers');
const fs = require('fs');
const nodemailer = require('nodemailer');
const User = require('./users');
const Task = require('./Tasks');
const File = require('./files_metadata');
const Agenda = require('./agenda');
const Invitation = require('./members');

// Connect to database
connectDB();

const app = express();
const port = 3000;

require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));


// ========== Middleware ==========
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'uwuugjernguergungufdngusdfgnsudfgnds',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// ========== Google OAuth ==========
const GOOGLE_CLIENT_ID = '672159425581-bldvjkf8k49hl05ssd9bucs0prequu6i.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async(accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                full_name: profile.displayName,
                email,
                password: crypto.randomBytes(32).toString('hex'),
                authType: 'google'
            });
        }

        return done(null, { id: user._id, email: user.email, name: user.full_name });
    } catch (err) {
        return done(err);
    }
}));

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'hassan.pink123@gmail.com',
        pass: 'rcbi eunf yahp ztga'
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Nodemailer configuration error:', error);
    } else {
        console.log('✅ Nodemailer ready to send emails');
    }
});

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ========== Auth Routes ==========
app.post('/login', async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        req.session.user = { id: user._id, email: user.email, name: user.full_name };
        res.json({ success: true, message: 'Login successful' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

app.post('/signup', async(req, res) => {
    const { full_name, email, password } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ full_name, email, password: hashedPassword, authType: 'local' });
        await user.save();
        res.status(201).json({ success: true, message: 'Signup successful' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during signup' });
    }
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
    (req, res) => {
        req.session.user = req.user;
        req.session.save(() => res.redirect('http://localhost:5173/dashboard'));
    }
);

app.get('/auth/user', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// ========== File Upload Configuration ==========
const uploadDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB
        files: 10
    }
});

app.use('/uploads', express.static(uploadDir));

// ========== File Upload Route ==========
app.post('/api/files', upload.array('files'), async(req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files were uploaded',
            });
        }

        const uploadedFiles = await Promise.all(req.files.map(async(file) => {
            const newFile = new File({
                name: file.originalname,
                size: file.size,
                path: file.path,
                type: file.mimetype,
                extension: path.extname(file.originalname).substring(1),
                uploadedAt: new Date(),
                //uploader: req.session ? .user ? .id || 'anonymous',

            });
            await newFile.save();

            return {
                _id: newFile._id,
                name: newFile.name,
                size: newFile.size,
                url: `/uploads/${path.basename(file.path)}`,
                downloadUrl: `/api/files/${newFile._id}/download`,
                uploadedAt: newFile.uploadedAt,
            };
        }));

        res.status(201).json({
            success: true,
            message: 'Files uploaded successfully',
            files: uploadedFiles,
        });
    } catch (error) {
        console.error('File save error:', error);
        /*req.files ? .forEach(file => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });*/

        res.status(500).json({
            success: false,
            message: 'File processing failed',
            error: error.message,
        });
    }
});

// Get All Files
app.get('/api/files', async(req, res) => {
    try {
        const { search } = req.query;
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        const files = await File.find(query).sort({ uploadedAt: -1 });
        const filesWithUrls = files.map(file => ({
            _id: file._id,
            name: file.name,
            size: file.size,
            type: file.type,
            extension: file.extension,
            uploadedAt: file.uploadedAt,
            url: `/uploads/${path.basename(file.path)}`,
            downloadUrl: `/api/files/${file._id}/download`,
        }));

        res.json({ success: true, data: filesWithUrls });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch files',
            error: error.message,
        });
    }
});

// Download File
app.get('/api/files/:id/download', async(req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(file.path, file.name);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to download file',
            error: error.message,
        });
    }
});

// Delete File
app.delete('/api/files/:id', async(req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        const file = await File.findByIdAndDelete(req.params.id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        res.json({
            success: true,
            message: 'File deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete file',
            error: error.message,
        });
    }
});

// ========== TASKS ROUTES ==========

// POST /tasks (regular + AI priority if Auto)
app.post('/tasks', async(req, res) => {
    try {
        const {
            title,
            content,
            project,
            status,
            assignee,
            dueDate,
            priority,
            storeOnChain
        } = req.body;

        let finalPriority = priority || "Auto";
        let confidence = null;

        // 🔍 Call AI API if priority is Auto
        if (finalPriority === "Auto") {
            const aiResponse = await axios.post("http://localhost:8000/predict-priority", {
                due_date: dueDate,
                description: title || content || "",
                estimated_hours: 5,
                task_type_encoded: 1,
                assigned_to_encoded: 2
            });

            finalPriority = aiResponse.data.priority || "Medium";
            confidence = aiResponse.data.confidence || 1.0;

            console.log("✅ AI Assigned Priority:", finalPriority, "| Confidence:", confidence);
        }

        const payload = {
            title: title || content,
            project,
            status: status || 'To Do',
            assignee: assignee || 'Unassigned',
            dueDate: dueDate ? new Date(dueDate) : new Date(),
            priority: finalPriority,
            priorityConfidence: confidence,
            createdAt: new Date(),
            lastUpdated: new Date()
        };

        // 🧱 Optional: Save on blockchain
        if (storeOnChain) {
            const result = await createTaskOnChain(payload.title, payload.assignee, payload.dueDate);
            if (!result.success) {
                return res.status(500).json({ success: false, error: result.error });
            }
            console.log(`✅ Task created on blockchain: taskId=${result.taskId}, txHash=${result.txHash}`);
        }

        const task = new Task(payload);
        await task.save();

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        console.error('❌ Create task error:', err.message || err);
        res.status(500).json({ success: false, error: 'Failed to create task' });
    }
});

// POST /tasks/nlp-create
app.post('/tasks/nlp-create', async(req, res) => {
    try {
        console.log("📝 Received NLP task data:", req.body);

        const { title, project, status, assignee, dueDate, priority } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, error: "Title is required" });
        }

        const taskData = {
            title,
            project: project || "General",
            status: status || "To Do",
            assignee: assignee || "Unassigned",
            dueDate: dueDate ? new Date(dueDate) : new Date(),
            priority: priority || "Auto",
            createdAt: new Date(),
            lastUpdated: new Date()
        };

        const task = new Task(taskData);
        await task.save();

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        console.error("❌ NLP task create error:", err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});



// PATCH update task
app.patch('/tasks/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const { title, assignee, dueDate, storeOnChain, ...updates } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: 'Invalid task ID' });
        }

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ success: false, error: 'Task not found' });
        }

        if (storeOnChain) {
            // Estimate blockchain task ID by counting tasks created before this one
            const taskIndex = await Task.countDocuments({ createdAt: { $lte: task.createdAt } }) - 1;
            const result = await updateTaskOnChain(taskIndex, title || task.title, assignee || task.assignee, dueDate || task.dueDate);
            if (!result.success) {
                return res.status(500).json({ success: false, error: result.error });
            }
            console.log(`✅ Task updated on blockchain: taskId=${taskIndex}, txHash=${result.txHash}`);
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id, {...updates, title, assignee, dueDate: dueDate ? new Date(dueDate) : task.dueDate, lastUpdated: new Date() }, { new: true }
        );

        res.json({ success: true, data: updatedTask });
    } catch (err) {
        console.error('Update task error:', err);
        res.status(500).json({ success: false, error: 'Failed to update task' });
    }
});

// GET all tasks
app.get('/tasks', async(req, res) => {
    try {
        const tasks = await Task.find();
        res.json({ success: true, data: tasks });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
    }
});

// GET single task
app.get('/tasks/:id', async(req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ success: false, error: 'Invalid task ID' });
    }

    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
        res.json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to fetch task' });
    }
});

// PATCH task status only
app.patch('/tasks/:id/status', async(req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id, { status: req.body.status, lastUpdated: new Date() }, { new: true }
        );
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
        res.json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});

// PATCH bulk update
app.patch('/tasks/bulk-update', async(req, res) => {
    const { taskIds, updates } = req.body;
    try {
        const result = await Task.updateMany({ _id: { $in: taskIds } }, { $set: {...updates, lastUpdated: new Date() } });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Bulk update failed' });
    }
});

// DELETE task
app.delete('/tasks/:id', async(req, res) => {
    try {
        const deleted = await Task.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
        res.json({ success: true, message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to delete task' });
    }
});

// ========== Blockchain Transactions Route ==========
app.get('/api/blockchain-transactions', async(req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: 1 }); // Sort by creation time to match blockchain order
        const blockchainTasks = await getBlockchainTasks();

        // Map MongoDB tasks to blockchain tasks by assuming sequential creation order
        const mappedTasks = tasks.map((task, index) => {
            const blockchainData = blockchainTasks.find(bcTask => bcTask.taskId === index.toString()) || {};
            return {
                _id: task._id,
                title: task.title,
                status: task.status || 'To Do',
                createdAt: task.createdAt,
                txHash: blockchainData.txHash || null,
                blockNumber: blockchainData.blockNumber || null,
                blockTimestamp: blockchainData.blockTimestamp || null,
                action: blockchainData.txHash ? (blockchainData.action || 'Created On-Chain') : 'Created Off-Chain'
            };
        });

        res.json({ success: true, data: mappedTasks });
    } catch (err) {
        console.error('Fetch blockchain transactions error:', err);
        res.status(500).json({ success: false, error: 'Failed to fetch blockchain transactions' });
    }
});

// ========== Analytics Route ==========
app.get('/api/analytics-data', async(req, res) => {
    try {
        const tasks = await Task.find();
        const statusCounts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});
        const priorityCounts = tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {});
        res.json({ success: true, data: { statusCounts, priorityCounts } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
    }
});

// ========== Invitation Routes ==========
app.post('/api/send-invites', async(req, res) => {
    const { emails, role = 'member', name } = req.body;

    if (!Array.isArray(emails)) {
        return res.status(400).json({ success: false, message: 'Emails must be an array', failedCount: 0, successfulInvites: [], failedInvites: [] });
    }
    if (emails.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one email required', failedCount: 0, successfulInvites: [], failedInvites: [] });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required', failedCount: 0, successfulInvites: [], failedInvites: [] });
    }

    try {
        const successfulInvites = [];
        const failedInvites = [];

        for (const email of emails) {
            try {
                if (!/^\S+@\S+\.\S+$/.test(email)) {
                    failedInvites.push({ email, error: 'Invalid email format' });
                    continue;
                }
                const token = crypto.randomBytes(16).toString('hex');
                await Invitation.create({
                    email,
                    name,
                    role,
                    token,
                    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                    createdAt: new Date(),
                });
                const acceptanceLink = `http://localhost:5173/accept-invite?token=${token}`;
                await transporter.sendMail({
                    from: '"AI Smart Task Chain" <hassan.pink123@gmail.com>',
                    to: email,
                    subject: `You've been invited to join as ${role}`,
                    html: `
            <p>Hello,</p>
            <p>${name} has invited you to join as a ${role}.</p>
            <p>Please click the link below to accept the invitation and set up your account:</p>
            <p><a href="${acceptanceLink}">${acceptanceLink}</a></p>
            <p>This link will expire in 14 days.</p>
            <p>If you did not expect this invitation, please ignore this email.</p>
          `,
                });
                console.log(`✅ Email sent to ${email}`);
                successfulInvites.push(email);
            } catch (err) {
                console.error(`❌ Error processing invitation for ${email}:`, err);
                failedInvites.push({ email, error: err.message });
            }
        }

        res.json({
            success: successfulInvites.length > 0,
            successfulInvites,
            failedCount: failedInvites.length,
            failedInvites,
        });
    } catch (err) {
        console.error('❌ Send invites error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            failedCount: 0,
            successfulInvites: [],
            failedInvites: [],
            error: err.message
        });
    }
});

app.get('/api/team/invitations', async(req, res) => {
    try {
        const invitations = await Invitation.find().sort({ createdAt: -1 });
        res.json({ success: true, data: invitations });
    } catch (err) {
        console.error('❌ Fetch invitations error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch invitations' });
    }
});

app.post('/api/accept-invite', async(req, res) => {
    try {
        const { token, name, password } = req.body;
        if (!token || !name || !password) {
            return res.status(400).json({ success: false, message: 'Token, name, and password are required' });
        }

        const invitation = await Invitation.findOne({ token });
        if (!invitation) {
            return res.status(404).json({ success: false, message: 'Invalid or expired invitation' });
        }

        if (invitation.expiresAt < new Date()) {
            await Invitation.deleteOne({ token });
            return res.status(410).json({ success: false, message: 'Invitation has expired' });
        }

        let user = await User.findOne({ email: invitation.email });
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                full_name: name,
                email: invitation.email,
                password: hashedPassword,
                authType: 'invited',
                role: invitation.role,
            });
        } else {
            user.role = invitation.role;
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
            await user.save();
        }

        await Invitation.deleteOne({ token });

        req.session.user = { id: user._id, email: user.email, name: user.full_name, role: user.role };
        res.json({ success: true, message: 'Invitation accepted', redirect: '/dashboard' });
    } catch (err) {
        console.error('❌ Accept invite error:', err);
        res.status(500).json({ success: false, message: 'Failed to accept invitation', error: err.message });
    }
});

// ========== AGENDA ROUTES ==========
app.post('/api/agendas', async(req, res) => {
    try {
        const { title, date, time, description, location, participants } = req.body;

        if (!title || !date) {
            return res.status(400).json({
                success: false,
                message: 'Title and date are required'
            });
        }

        const agenda = new Agenda({
            title,
            date: new Date(date),
            time,
            description,
            location,
            participants: participants || [],
            createdBy: req.session.user.id
        });

        await agenda.save();
        res.status(201).json({
            success: true,
            message: 'Agenda created successfully',
            data: agenda
        });
    } catch (err) {
        console.error('Create agenda error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to create agenda'
        });
    }
});

app.get('/api/agendas', async(req, res) => {
    try {
        const { search, from, to } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (from && to) {
            query.date = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }

        const agendas = await Agenda.find(query)
            .sort({ date: 1 })
            .populate('createdBy', 'full_name email');

        res.json({
            success: true,
            data: agendas
        });
    } catch (err) {
        console.error('Get agendas error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agendas'
        });
    }
});

app.get('/api/agendas/:id', async(req, res) => {
    try {
        const agenda = await Agenda.findById(req.params.id)
            .populate('createdBy', 'full_name email');

        if (!agenda) {
            return res.status(404).json({
                success: false,
                message: 'Agenda not found'
            });
        }

        res.json({
            success: true,
            data: agenda
        });
    } catch (err) {
        console.error('Get agenda error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agenda'
        });
    }
});

app.patch('/api/agendas/:id', async(req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.date) {
            updates.date = new Date(updates.date);
        }

        const agenda = await Agenda.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'full_name email');

        if (!agenda) {
            return res.status(404).json({
                success: false,
                message: 'Agenda not found'
            });
        }

        res.json({
            success: true,
            message: 'Agenda updated successfully',
            data: agenda
        });
    } catch (err) {
        console.error('Update agenda error:', err);
        res.status(500).json({
            success: false,
            message: err.message || 'Failed to update agenda'
        });
    }
});

app.delete('/api/agendas/:id', async(req, res) => {
    try {
        const agenda = await Agenda.findByIdAndDelete(req.params.id);

        if (!agenda) {
            return res.status(404).json({
                success: false,
                message: 'Agenda not found'
            });
        }

        res.json({
            success: true,
            message: 'Agenda deleted successfully'
        });
    } catch (err) {
        console.error('Delete agenda error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete agenda'
        });
    }
});

// ========== Password Reset Routes ==========
app.post('/forgot-password', async(req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const resetUrl = `${req.headers.origin}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: '"AI Smart Task Chain" <hassan.pink123@gmail.com>',
            to: user.email,
            subject: 'Password Reset Request',
            html: `
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset link has been sent to your email.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Error processing your request. Please try again.' });
    }
});

app.post('/api/reset-password', async(req, res) => {
    const { token, password, confirmPassword } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Reset token is required'
        });
    }

    if (!password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Both password fields are required'
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters'
        });
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Password reset token is invalid or has expired. Please request a new reset link.'
            });
        }

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.passwordChangedAt = Date.now();

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.',
            redirect: '/login'
        });

    } catch (error) {
        console.error('🔴 Password reset error:', {
            error: error.message,
            stack: error.stack,
            token: token,
            timestamp: new Date().toISOString()
        });

        return res.status(500).json({
            success: false,
            message: 'An error occurred while resetting your password. Please try again later.'
        });
    }
});

app.get('/reset-password', (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).send('Token is required');
    }
    res.sendFile(path.join(__dirname, 'public', 'ResetPassword.jsx'));
});

// ========== Start Server ==========
app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
});
