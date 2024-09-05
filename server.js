const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nano = require('nano');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;
const host = '127.0.0.1'; // This is the IP address for localhost

//CORS is used but is more restricted here.

app.use(bodyParser.json());
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader('X-DNS-Prefetch-Control', 'off'); // DNS Prefetch Control
    res.setHeader('X-Frame-Options', 'DENY'); // Frameguard (Clickjacking Protection)
    res.setHeader('X-Content-Type-Options', 'nosniff'); // NoSniff (MIME Type Sniffing Protection)
    res.setHeader('X-XSS-Protection', '1; mode=block'); // XSS Filter (Cross-Site Scripting Protection)
    res.setHeader('Referrer-Policy', 'no-referrer'); // Referrer Policy
    next();
});

// Use environment variables for CouchDB credentials
const dbUrl = `http://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASSWORD}@localhost:5984`;
const couch = nano(dbUrl);

// Connect to CouchDB and create a database if it doesn't exist
const dbName = 'your-database-name-goes-here';
const db = couch.use(dbName);

couch.db.create(dbName, (err) => {
    if (err && err.statusCode !== 412) {
        console.error('Error creating database:', err);
    } else {
        console.log('Database created or already exists.');
    }
});

// Helper function to initialize data structure if it doesn't exist
async function initializeDocument(docId, initialData) {
    const existing = await db.get(docId).catch(() => null);
    if (!existing) {
        initialData._id = docId;
        await db.insert(initialData);
    }
}

// Helper function to fetch a document
async function fetchDocument(docId) {
    return db.get(docId).catch(() => null);
}

// Helper function to save a document
async function saveDocument(docId, data) {
    const existing = await fetchDocument(docId);
    if (existing) {
        data._id = docId;
        data._rev = existing._rev;
    } else {
        data._id = docId;
    }
    return db.insert(data);
}


//Some More Cybersecurity Considerations

// Middleware to enforce localhost access only
app.use((req, res, next) => {
    const ip = req.ip;
    if (ip === '127.0.0.1' || ip === '::1') { // IPv4 and IPv6 loopback addresses
        next(); // Allow requests from localhost
    } else {
        res.status(403).json({ error: 'Access forbidden: Only localhost is allowed.' });
    }
});

// Function to sanitize user input
const sanitizeInput = (input) => {
    return input.replace(/[\r\n]/g, ' ').replace(/[<>]/g, '');
};

// Basic input validation
function isValidInput(input) {
    return typeof input === 'string' && input.trim().length > 0 && input.length < 500;
}

// Secure session cookie setting middleware
app.use((req, res, next) => {
    res.cookie('sessionID', 'your-session-id', {
        httpOnly: true,       // Prevents JavaScript access
        sameSite: 'Strict',   // Prevents CSRF by disallowing third-party sites from sending requests
    });
    next();
});

//Disable Express Related Header
app.disable('x-powered-by');

// Rate limiting middleware
let requestCounts = {};

app.use((req, res, next) => {
    const ip = req.ip;
    if (!requestCounts[ip]) {
        requestCounts[ip] = 0;
    }
    requestCounts[ip]++;

    if (requestCounts[ip] > 500) { // Limit to 500 requests per 15 minutes
        return res.status(429).json({ error: 'Too many requests' });
    }

    // Reset the count every 15 minutes
    setTimeout(() => {
        requestCounts[ip] = 0;
    }, 15 * 60 * 1000);

    next();
});

// Honeypot Section

// Middleware to parse POST data
app.use(express.urlencoded({ extended: true }));

// Function to log access attempts asynchronously
function logAttempt(req, additionalInfo = '') {
    const ip = sanitizeInput(req.ip);
    const userAgent = sanitizeInput(req.headers['user-agent']);
    const logData = `${new Date().toISOString()} - Access attempt from IP: ${ip}, User-Agent: ${userAgent} ${additionalInfo}\n`;

    fs.appendFile('honeypot.log', logData, (err) => {
        if (err) {
            console.error('Failed to write log:', err);
        }
    });
}

// Route to serve the fake admin panel
app.get('/admin-panel-secure', (req, res) => {
    logAttempt(req);
    res.send(`
        <html>
        <head>
            <title>Admin Panel</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { max-width: 300px; margin: 0 auto; padding-top: 50px; }
                input[type="text"], input[type="password"] { width: 100%; padding: 10px; margin: 5px 0; }
                button { width: 100%; padding: 10px; background-color: #007BFF; color: white; border: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Admin Login</h2>
                <form method="POST" action="/admin-panel-secure/login">
                    <input type="text" name="username" placeholder="Username" required><br>
                    <input type="password" name="password" placeholder="Password" required><br>
                    <button type="submit">Login</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Fake login route to capture credentials with a delay
app.post('/admin-panel-secure/login', (req, res) => {
    const username = sanitizeInput(req.body.username);
    const password = sanitizeInput(req.body.password);
    logAttempt(req, `Username: ${username}, Password: ${password}`);

    // Introduce a delay to simulate processing time
    setTimeout(() => {
        res.redirect('/admin-panel-secure'); // Redirect back to the login page after the delay
    }, 2000); // Delay time in seconds - 1000 equals 1 second here.
});



//Routes Section Start

// Organizational Mission Routes
app.post('/save-mission', async (req, res) => {
    try {
        const response = await saveDocument('organizational-mission', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/mission-data', async (req, res) => {
    try {
        await initializeDocument('organizational-mission', { mission: '' });
        const data = await db.get('organizational-mission');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

// Stakeholders Routes
app.post('/save-stakeholders', async (req, res) => {
    try {
        const response = await saveDocument('stakeholders', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/stakeholders-data', async (req, res) => {
    try {
        await initializeDocument('stakeholders', { stakeholders: [] });
        const data = await db.get('stakeholders');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-stakeholder/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('stakeholders').catch(() => null);
        if (data && data.stakeholders && index >= 0 && index < data.stakeholders.length) {
            data.stakeholders.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Stakeholder not found' });
        }
    } catch (err) {
        console.error('Error deleting stakeholder:', err);
        res.status(500).json({ error: 'Failed to delete stakeholder' });
    }
});

app.put('/update-stakeholder/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('stakeholders').catch(() => null);
        if (data && data.stakeholders && index >= 0 && index < data.stakeholders.length) {
            data.stakeholders[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Stakeholder not found' });
        }
    } catch (err) {
        console.error('Error updating stakeholder:', err);
        res.status(500).json({ error: 'Failed to update stakeholder' });
    }
});

// Legal Requirements Routes
app.post('/save-legal-requirements', async (req, res) => {
    try {
        const response = await saveDocument('legal-requirements', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/legal-requirements-data', async (req, res) => {
    try {
        await initializeDocument('legal-requirements', { requirements: [] });
        const data = await db.get('legal-requirements');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-legal-requirement/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('legal-requirements').catch(() => null);
        if (data && data.requirements && index >= 0 && index < data.requirements.length) {
            data.requirements.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Requirement not found' });
        }
    } catch (err) {
        console.error('Error deleting requirement:', err);
        res.status(500).json({ error: 'Failed to delete requirement' });
    }
});

app.put('/update-legal-requirement/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('legal-requirements').catch(() => null);
        if (data && data.requirements && index >= 0 && index < data.requirements.length) {
            data.requirements[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Requirement not found' });
        }
    } catch (err) {
        console.error('Error updating requirement:', err);
        res.status(500).json({ error: 'Failed to update requirement' });
    }
});

// Dependencies Routes
app.post('/save-dependencies', async (req, res) => {
    try {
        const response = await saveDocument('dependencies', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/dependencies-data', async (req, res) => {
    try {
        await initializeDocument('dependencies', { dependencies: [] });
        const data = await db.get('dependencies');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-dependency/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('dependencies').catch(() => null);
        if (data && data.dependencies && index >= 0 && index < data.dependencies.length) {
            data.dependencies.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Dependency not found' });
        }
    } catch (err) {
        console.error('Error deleting dependency:', err);
        res.status(500).json({ error: 'Failed to delete dependency' });
    }
});

app.put('/update-dependency/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('dependencies').catch(() => null);
        if (data && data.dependencies && index >= 0 && index < data.dependencies.length) {
            data.dependencies[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Dependency not found' });
        }
    } catch (err) {
        console.error('Error updating dependency:', err);
        res.status(500).json({ error: 'Failed to update dependency' });
    }
});

// Risk Appetite Routes
app.post('/save-risks', async (req, res) => {
    try {
        const response = await saveDocument('risk-appetite', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving risks:', err);
        res.status(500).json({ error: 'Failed to save risks' });
    }
});

app.get('/risks-data', async (req, res) => {
    try {
        await initializeDocument('risk-appetite', { risks: [] });
        const data = await db.get('risk-appetite');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving risks:', err);
        res.status(500).json({ error: 'Failed to retrieve risks' });
    }
});

app.delete('/delete-risk/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('risk-appetite').catch(() => null);
        if (data && data.risks && index >= 0 && index < data.risks.length) {
            data.risks.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Risk not found' });
        }
    } catch (err) {
        console.error('Error deleting risk:', err);
        res.status(500).json({ error: 'Failed to delete risk' });
    }
});

app.put('/update-risk/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('risk-appetite').catch(() => null);
        if (data && data.risks && index >= 0 && index < data.risks.length) {
            data.risks[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Risk not found' });
        }
    } catch (err) {
        console.error('Error updating risk:', err);
        res.status(500).json({ error: 'Failed to update risk' });
    }
});

// Risk Management Objectives Routes
app.post('/save-objectives', async (req, res) => {
    try {
        const response = await saveDocument('objectives', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/objectives-data', async (req, res) => {
    try {
        await initializeDocument('objectives', { objectives: [] });
        const data = await db.get('objectives');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-objective/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('objectives').catch(() => null);
        if (data && data.objectives && index >= 0 && index < data.objectives.length) {
            data.objectives.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Objective not found' });
        }
    } catch (err) {
        console.error('Error deleting objective:', err);
        res.status(500).json({ error: 'Failed to delete objective' });
    }
});

app.put('/update-objective/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('objectives').catch(() => null);
        if (data && data.objectives && index >= 0 && index < data.objectives.length) {
            data.objectives[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Objective not found' });
        }
    } catch (err) {
        console.error('Error updating objective:', err);
        res.status(500).json({ error: 'Failed to update objective' });
    }
});

// Cybersecurity Risk Management Activities and Outcomes Routes
app.post('/save-cybersecurity-risk-management', async (req, res) => {
    try {
        const response = await saveDocument('cybersecurity-risk-management', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/cybersecurity-risk-management-data', async (req, res) => {
    try {
        await initializeDocument('cybersecurity-risk-management', { entries: [] });
        const data = await db.get('cybersecurity-risk-management');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-cybersecurity-risk-management/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('cybersecurity-risk-management').catch(() => null);
        if (data && data.entries && index >= 0 && index < data.entries.length) {
            data.entries.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Entry not found' });
        }
    } catch (err) {
        console.error('Error deleting entry:', err);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});

app.put('/update-cybersecurity-risk-management/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('cybersecurity-risk-management').catch(() => null);
        if (data && data.entries && index >= 0 && index < data.entries.length) {
            data.entries[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Entry not found' });
        }
    } catch (err) {
        console.error('Error updating entry:', err);
        res.status(500).json({ error: 'Failed to update entry' });
    }
});

// Compliance and Oversight Adjustment Routes
app.post('/save-compliance-oversight', async (req, res) => {
    try {
        const response = await saveDocument('compliance-oversight', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/compliance-oversight-data', async (req, res) => {
    try {
        await initializeDocument('compliance-oversight', { complianceOversightData: [] });
        const data = await db.get('compliance-oversight');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-compliance-oversight/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('compliance-oversight').catch(() => null);
        if (data && data.complianceOversightData && index >= 0 && index < data.complianceOversightData.length) {
            data.complianceOversightData.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (err) {
        console.error('Error deleting data:', err);
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

app.put('/update-compliance-oversight/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('compliance-oversight').catch(() => null);
        if (data && data.complianceOversightData && index >= 0 && index < data.complianceOversightData.length) {
            data.complianceOversightData[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Failed to update data' });
    }
});


// Performance and Metrics Evaluation Routes
app.post('/save-performance-metrics', async (req, res) => {
    try {
        const response = await saveDocument('performance-metrics', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/performance-metrics-data', async (req, res) => {
    try {
        await initializeDocument('performance-metrics', { performanceMetricsData: [] });
        const data = await db.get('performance-metrics');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-performance-metrics/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('performance-metrics').catch(() => null);
        if (data && data.performanceMetricsData && index >= 0 && index < data.performanceMetricsData.length) {
            data.performanceMetricsData.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (err) {
        console.error('Error deleting data:', err);
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

app.put('/update-performance-metrics/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('performance-metrics').catch(() => null);
        if (data && data.performanceMetricsData && index >= 0 && index < data.performanceMetricsData.length) {
            data.performanceMetricsData[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Failed to update data' });
    }
});

// Strategic Risk Management Review Routes
app.post('/save-strategic-risk-management', async (req, res) => {
    try {
        const response = await saveDocument('strategic-risk-management', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/strategic-risk-management-data', async (req, res) => {
    try {
        await initializeDocument('strategic-risk-management', { strategicRiskManagementData: [] });
        const data = await db.get('strategic-risk-management');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-strategic-risk-management/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('strategic-risk-management').catch(() => null);
        if (data && data.strategicRiskManagementData && index >= 0 && index < data.strategicRiskManagementData.length) {
            data.strategicRiskManagementData.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (err) {
        console.error('Error deleting data:', err);
        res.status(500).json({ error: 'Failed to delete data' });
    }
});

app.put('/update-strategic-risk-management/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('strategic-risk-management').catch(() => null);
        if (data && data.strategicRiskManagementData && index >= 0 && index < data.strategicRiskManagementData.length) {
            data.strategicRiskManagementData[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (err) {
        console.error('Error updating data:', err);
        res.status(500).json({ error: 'Failed to update data' });
    }
});

// Strategic Direction Routes
app.post('/save-strategic-direction', async (req, res) => {
    try {
        const response = await saveDocument('strategic-direction', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/strategic-direction-data', async (req, res) => {
    try {
        await initializeDocument('strategic-direction', { directions: [] });
        const data = await db.get('strategic-direction');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-strategic-direction/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('strategic-direction').catch(() => null);
        if (data && data.directions && index >= 0 && index < data.directions.length) {
            data.directions.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Direction not found' });
        }
    } catch (err) {
        console.error('Error deleting direction:', err);
        res.status(500).json({ error: 'Failed to delete direction' });
    }
});

app.put('/update-strategic-direction/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('strategic-direction').catch(() => null);
        if (data && data.directions && index >= 0 && index < data.directions.length) {
            data.directions[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Direction not found' });
        }
    } catch (err) {
        console.error('Error updating direction:', err);
        res.status(500).json({ error: 'Failed to update direction' });
    }
});

// Communication Lines - Communication Tools Routes
app.post('/save-communication-tools', async (req, res) => {
    try {
        const response = await saveDocument('communication-tools', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/communication-tools-data', async (req, res) => {
    try {
        await initializeDocument('communication-tools', { tools: [] });
        const data = await db.get('communication-tools');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-communication-tool/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('communication-tools').catch(() => null);
        if (data && data.tools && index >= 0 && index < data.tools.length) {
            data.tools.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Tool not found' });
        }
    } catch (err) {
        console.error('Error deleting tool:', err);
        res.status(500).json({ error: 'Failed to delete tool' });
    }
});

app.put('/update-communication-tool/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('communication-tools').catch(() => null);
        if (data && data.tools && index >= 0 && index < data.tools.length) {
            data.tools[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Tool not found' });
        }
    } catch (err) {
        console.error('Error updating tool:', err);
        res.status(500).json({ error: 'Failed to update tool' });
    }
});



// Communication Lines - Executive Updates Routes
app.post('/save-executive-updates', async (req, res) => {
    try {
        const response = await saveDocument('executive-updates', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/executive-updates-data', async (req, res) => {
    try {
        await initializeDocument('executive-updates', { updates: [] });
        const data = await db.get('executive-updates');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-executive-update/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('executive-updates').catch(() => null);
        if (data && data.updates && index >= 0 && index < data.updates.length) {
            data.updates.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Update not found' });
        }
    } catch (err) {
        console.error('Error deleting update:', err);
        res.status(500).json({ error: 'Failed to delete update' });
    }
});

app.put('/update-executive-update/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('executive-updates').catch(() => null);
        if (data && data.updates && index >= 0 && index < data.updates.length) {
            data.updates[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Update not found' });
        }
    } catch (err) {
        console.error('Error updating update:', err);
        res.status(500).json({ error: 'Failed to update update' });
    }
});

// Communication Lines - Departmental Communication Routes
app.post('/save-departmental-communication', async (req, res) => {
    try {
        const response = await saveDocument('departmental-communication', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/departmental-communication-data', async (req, res) => {
    try {
        await initializeDocument('departmental-communication', { updates: [] });
        const data = await db.get('departmental-communication');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-departmental-communication/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('departmental-communication').catch(() => null);
        if (data && data.updates && index >= 0 && index < data.updates.length) {
            data.updates.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Update not found' });
        }
    } catch (err) {
        console.error('Error deleting update:', err);
        res.status(500).json({ error: 'Failed to delete update' });
    }
});

app.put('/update-departmental-communication/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('departmental-communication').catch(() => null);
        if (data && data.updates && index >= 0 && index < data.updates.length) {
            data.updates[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Update not found' });
        }
    } catch (err) {
        console.error('Error updating update:', err);
        res.status(500).json({ error: 'Failed to update update' });
    }
});

// Standardized Risk Methods Routes
app.post('/save-standardized-risk-methods', async (req, res) => {
    try {
        const response = await saveDocument('standardized-risk-methods', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving standardized risk methods:', err);
        res.status(500).json({ error: 'Failed to save methods' });
    }
});

app.get('/standardized-risk-methods-data', async (req, res) => {
    try {
        await initializeDocument('standardized-risk-methods', { methods: '' });
        const data = await db.get('standardized-risk-methods');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving standardized risk methods:', err);
        res.status(500).json({ error: 'Failed to retrieve methods' });
    }
});

// Strategic Opportunities Routes
app.get('/strategic-opportunities-data', async (req, res) => {
    try {
        await initializeDocument('strategic-opportunities', { opportunities: [] });
        const data = await db.get('strategic-opportunities');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving strategic opportunities:', err);
        res.status(500).json({ error: 'Failed to retrieve strategic opportunities' });
    }
});

app.post('/save-strategic-opportunities', async (req, res) => {
    try {
        const response = await saveDocument('strategic-opportunities', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving strategic opportunities:', err);
        res.status(500).json({ error: 'Failed to save strategic opportunities' });
    }
});

app.delete('/delete-strategic-opportunity/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('strategic-opportunities').catch(() => null);
        if (data && data.opportunities && index >= 0 && index < data.opportunities.length) {
            data.opportunities.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Opportunity not found' });
        }
    } catch (err) {
        console.error('Error deleting opportunity:', err);
        res.status(500).json({ error: 'Failed to delete opportunity' });
    }
});

// Leadership Accountability and Risk Culture Routes
app.get('/leadership-accountability-and-risk-culture-data', async (req, res) => {
    try {
        const data = await db.get('leadership-accountability-and-risk-culture');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving leadership accountability and risk culture data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.post('/save-leadership-accountability-and-risk-culture', async (req, res) => {
    try {
        const response = await saveDocument('leadership-accountability-and-risk-culture', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving leadership accountability data:', err);
        res.status(500).json({ error: 'Failed to save leadership accountability data' });
    }
});

app.delete('/delete-leadership-accountability-and-risk-culture/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('leadership-accountability-and-risk-culture').catch(() => null);
        if (data && data.leadership && index >= 0 && index < data.leadership.length) {
            data.leadership.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Leadership data not found' });
        }
    } catch (err) {
        console.error('Error deleting leadership data:', err);
        res.status(500).json({ error: 'Failed to delete leadership data' });
    }
});

// Defined Cybersecurity Roles Routes
app.get('/defined-cybersecurity-roles-data', async (req, res) => {
    try {
        await initializeDocument('defined-cybersecurity-roles', { roles: [] });
        const data = await db.get('defined-cybersecurity-roles');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving defined cybersecurity roles data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.post('/save-defined-cybersecurity-roles', async (req, res) => {
    try {
        const response = await saveDocument('defined-cybersecurity-roles', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving defined cybersecurity roles:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.delete('/delete-defined-cybersecurity-role/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('defined-cybersecurity-roles').catch(() => null);
        if (data && data.roles && index >= 0 && index < data.roles.length) {
            data.roles.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Role not found' });
        }
    } catch (err) {
        console.error('Error deleting defined cybersecurity role:', err);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

app.get('/resource-allocation-data', async (req, res) => {
    try {
        await initializeDocument('resource-allocation', { allocations: [] });
        const data = await db.get('resource-allocation');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving resource allocation data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});
app.post('/save-resource-allocation', async (req, res) => {
    try {
        const response = await saveDocument('resource-allocation', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving resource allocation data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});
app.delete('/delete-resource-allocation/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('resource-allocation').catch(() => null);
        if (data && data.allocations && index >= 0 && index < data.allocations.length) {
            data.allocations.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Allocation not found' });
        }
    } catch (err) {
        console.error('Error deleting resource allocation:', err);
        res.status(500).json({ error: 'Failed to delete allocation' });
    }
});

// Cybersecurity HR Practices Routes
app.get('/cybersecurity-hr-data', async (req, res) => {
    try {
        await initializeDocument('cybersecurity-hr', { hrPractices: [] });
        const data = await db.get('cybersecurity-hr');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving cybersecurity HR practices data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.post('/save-cybersecurity-hr', async (req, res) => {
    try {
        const response = await saveDocument('cybersecurity-hr', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving cybersecurity HR practices:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.delete('/delete-cybersecurity-hr/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('cybersecurity-hr').catch(() => null);
        if (data && data.hrPractices && index >= 0 && index < data.hrPractices.length) {
            data.hrPractices.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Practice not found' });
        }
    } catch (err) {
        console.error('Error deleting cybersecurity HR practice:', err);
        res.status(500).json({ error: 'Failed to delete practice' });
    }
});

//GV.PO-01 Cybersecurity Policy Routes

app.get('/cybersecurity-policy-data', async (req, res) => {
    try {
        await initializeDocument('cybersecurity-policy', { policies: [] });
        const data = await db.get('cybersecurity-policy');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving cybersecurity policy data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.post('/save-cybersecurity-policy', async (req, res) => {
    try {
        const response = await saveDocument('cybersecurity-policy', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving cybersecurity policy:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.delete('/delete-cybersecurity-policy/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('cybersecurity-policy').catch(() => null);
        if (data && data.policies && index >= 0 && index < data.policies.length) {
            data.policies.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Policy not found' });
        }
    } catch (err) {
        console.error('Error deleting cybersecurity policy:', err);
        res.status(500).json({ error: 'Failed to delete policy' });
    }
});

//GV.PO-02 Regularly Updated Cybersecurity Policy Routes

app.get('/regularly-updated-cybersecurity-policy-data', async (req, res) => {
    try {
        await initializeDocument('regularly-updated-cybersecurity-policy', { policies: [] });
        const data = await db.get('regularly-updated-cybersecurity-policy');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving regularly updated cybersecurity policy data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});
app.post('/save-regularly-updated-cybersecurity-policy', async (req, res) => {
    try {
        const response = await saveDocument('regularly-updated-cybersecurity-policy', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving regularly updated cybersecurity policy:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});
app.delete('/delete-regularly-updated-cybersecurity-policy/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('regularly-updated-cybersecurity-policy').catch(() => null);
        if (data && data.policies && index >= 0 && index < data.policies.length) {
            data.policies.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Policy not found' });
        }
    } catch (err) {
        console.error('Error deleting regularly updated cybersecurity policy:', err);
        res.status(500).json({ error: 'Failed to delete policy' });
    }
});
app.put('/update-regularly-updated-cybersecurity-policy/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('regularly-updated-cybersecurity-policy').catch(() => null);
        if (data && data.policies && index >= 0 && index < data.policies.length) {
            data.policies[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Policy not found' });
        }
    } catch (err) {
        console.error('Error updating regularly updated cybersecurity policy:', err);
        res.status(500).json({ error: 'Failed to update policy' });
    }
});

// IT/OT Assets Routes
app.post('/save-it-ot-assets', async (req, res) => {
    try {
        const response = await saveDocument('it-ot-assets', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/it-ot-assets-data', async (req, res) => {
    try {
        await initializeDocument('it-ot-assets', { assets: [] });
        const data = await db.get('it-ot-assets');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-it-ot-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('it-ot-assets').catch(() => null);
        if (data && data.assets && index >= 0 && index < data.assets.length) {
            data.assets.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Asset not found' });
        }
    } catch (err) {
        console.error('Error deleting asset:', err);
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});

app.put('/update-it-ot-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('it-ot-assets').catch(() => null);
        if (data && data.assets && index >= 0 && index < data.assets.length) {
            data.assets[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Asset not found' });
        }
    } catch (err) {
        console.error('Error updating asset:', err);
        res.status(500).json({ error: 'Failed to update asset' });
    }
});

// Software Assets Routes
app.post('/save-software-assets', async (req, res) => {
    try {
        const response = await saveDocument('software-assets', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/software-assets-data', async (req, res) => {
    try {
        await initializeDocument('software-assets', { assets: [] });
        const data = await db.get('software-assets');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-software-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('software-assets').catch(() => null);
        if (data && data.assets && index >= 0 && index < data.assets.length) {
            data.assets.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Asset not found' });
        }
    } catch (err) {
        console.error('Error deleting asset:', err);
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});

app.put('/update-software-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('software-assets').catch(() => null);
        if (data && data.assets && index >= 0 && index < data.assets.length) {
            data.assets[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Asset not found' });
        }
    } catch (err) {
        console.error('Error updating asset:', err);
        res.status(500).json({ error: 'Failed to update asset' });
    }
});

// Other Fixed Assets Routes
app.post('/save-other-fixed-assets', async (req, res) => {
    try {
        const response = await saveDocument('other-fixed-assets', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/other-fixed-assets-data', async (req, res) => {
    try {
        await initializeDocument('other-fixed-assets', { assets: [] });
        const data = await db.get('other-fixed-assets');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-other-fixed-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('other-fixed-assets').catch(() => null);
        if (data && data.assets && index >= 0 && index < data.assets.length) {
            data.assets.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Asset not found' });
        }
    } catch (err) {
        console.error('Error deleting asset:', err);
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});

app.put('/update-other-fixed-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('other-fixed-assets').catch(() => null);
        if (data && data.assets && index >= 0 && index < data.assets.length) {
            data.assets[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Asset not found' });
        }
    } catch (err) {
        console.error('Error updating asset:', err);
        res.status(500).json({ error: 'Failed to update asset' });
    }
});

// Route to save network diagram positions
app.post('/save-network-diagram', async (req, res) => {
    try {
        const response = await saveDocument('network-diagram', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving network diagram:', err);
        res.status(500).json({ error: 'Failed to save network diagram' });
    }
});

// Route to get network diagram positions
app.get('/network-diagram-positions', async (req, res) => {
    try {
        await initializeDocument('network-diagram', { positions: {} });
        const data = await db.get('network-diagram');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving network diagram:', err);
        res.status(500).json({ error: 'Failed to retrieve network diagram' });
    }
});

// Network Connector Types Routes
app.post('/save-network-connector-type', async (req, res) => {
    try {
        const response = await saveDocument('network-connector-types', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/network-connector-types-data', async (req, res) => {
    try {
        await initializeDocument('network-connector-types', { connectorTypes: [] });
        const data = await db.get('network-connector-types');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

// Network Connectors Routes
app.post('/save-network-connectors', async (req, res) => {
    try {
        const response = await saveDocument('network-connectors', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving network connectors:', err);
        res.status(500).json({ error: 'Failed to save network connectors' });
    }
});

app.get('/network-connectors-data', async (req, res) => {
    try {
        await initializeDocument('network-connectors', { connectors: [] });
        const data = await db.get('network-connectors');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving network connectors:', err);
        res.status(500).json({ error: 'Failed to retrieve network connectors' });
    }
});

// Initialize document if it doesn't exist
async function initializeDocument(docId, defaultData) {
    try {
        const doc = await db.get(docId);
        if (!doc) {
            await db.insert({ _id: docId, ...defaultData });
        }
    } catch (err) {
        if (err.statusCode === 404) {
            await db.insert({ _id: docId, ...defaultData });
        } else {
            throw err;
        }
    }
}

// Save document to the database
async function saveDocument(docId, data) {
    try {
        const doc = await db.get(docId);
        const updatedDoc = { ...doc, ...data };
        const response = await db.insert(updatedDoc);
        return response;
    } catch (err) {
        if (err.statusCode === 404) {
            const response = await db.insert({ _id: docId, ...data });
            return response;
        } else {
            throw err;
        }
    }
}

// Cash Assets Routes
app.post('/save-cash-assets', async (req, res) => {
    try {
        const response = await saveDocument('cash-assets', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/cash-assets-data', async (req, res) => {
    try {
        await initializeDocument('cash-assets', { cashAssets: [] });
        const data = await db.get('cash-assets');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-cash-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('cash-assets').catch(() => null);
        if (data && data.cashAssets && index >= 0 && index < data.cashAssets.length) {
            data.cashAssets.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Cash asset not found' });
        }
    } catch (err) {
        console.error('Error deleting cash asset:', err);
        res.status(500).json({ error: 'Failed to delete cash asset' });
    }
});

app.put('/update-cash-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('cash-assets').catch(() => null);
        if (data && data.cashAssets && index >= 0 && index < data.cashAssets.length) {
            data.cashAssets[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Cash asset not found' });
        }
    } catch (err) {
        console.error('Error updating cash asset:', err);
        res.status(500).json({ error: 'Failed to update cash asset' });
    }
});

// Accounts Receivable Routes
app.post('/save-receivables', async (req, res) => {
    try {
        const response = await saveDocument('receivables', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/receivables-data', async (req, res) => {
    try {
        await initializeDocument('receivables', { receivables: [] });
        const data = await db.get('receivables');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-receivable/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('receivables').catch(() => null);
        if (data && data.receivables && index >= 0 && index < data.receivables.length) {
            data.receivables.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Receivable not found' });
        }
    } catch (err) {
        console.error('Error deleting receivable:', err);
        res.status(500).json({ error: 'Failed to delete receivable' });
    }
});

app.put('/update-receivable/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('receivables').catch(() => null);
        if (data && data.receivables && index >= 0 && index < data.receivables.length) {
            data.receivables[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Receivable not found' });
        }
    } catch (err) {
        console.error('Error updating receivable:', err);
        res.status(500).json({ error: 'Failed to update receivable' });
    }
});

// Inventory Routes
app.post('/save-inventory', async (req, res) => {
    try {
        const response = await saveDocument('inventory', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/inventory-data', async (req, res) => {
    try {
        await initializeDocument('inventory', { inventory: [] });
        const data = await db.get('inventory');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-inventory/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('inventory').catch(() => null);
        if (data && data.inventory && index >= 0 && index < data.inventory.length) {
            data.inventory.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Inventory item not found' });
        }
    } catch (err) {
        console.error('Error deleting inventory item:', err);
        res.status(500).json({ error: 'Failed to delete inventory item' });
    }
});

app.put('/update-inventory/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('inventory').catch(() => null);
        if (data && data.inventory && index >= 0 && index < data.inventory.length) {
            data.inventory[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Inventory item not found' });
        }
    } catch (err) {
        console.error('Error updating inventory item:', err);
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
});

// Other Current Assets Routes
app.post('/save-other-assets', async (req, res) => {
    try {
        const response = await saveDocument('other-assets', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.get('/other-assets-data', async (req, res) => {
    try {
        await initializeDocument('other-assets', { otherAssets: [] });
        const data = await db.get('other-assets');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
});

app.delete('/delete-other-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('other-assets').catch(() => null);
        if (data && data.otherAssets && index >= 0 && index < data.otherAssets.length) {
            data.otherAssets.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Other asset not found' });
        }
    } catch (err) {
        console.error('Error deleting other asset:', err);
        res.status(500).json({ error: 'Failed to delete other asset' });
    }
});

app.put('/update-other-asset/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('other-assets').catch(() => null);
        if (data && data.otherAssets && index >= 0 && index < data.otherAssets.length) {
            data.otherAssets[index] = req.body;
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Other asset not found' });
        }
    } catch (err) {
        console.error('Error updating other asset:', err);
        res.status(500).json({ error: 'Failed to update other asset' });
    }
});

app.post('/save-valuation-method', async (req, res) => {
    try {
        const response = await saveDocument('inventory-valuation-method', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving valuation method:', err);
        res.status(500).json({ error: 'Failed to save valuation method' });
    }
});

app.get('/valuation-method-data', async (req, res) => {
    try {
        await initializeDocument('inventory-valuation-method', { valuationMethod: '' });
        const data = await db.get('inventory-valuation-method');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving valuation method data:', err);
        res.status(500).json({ error: 'Failed to retrieve valuation method data' });
    }
});

// Cybersecurity Supply Chain Risk Management Routes
app.post('/save-suppliers', async (req, res) => {
    try {
        // Fetch the existing suppliers document
        const data = await db.get('suppliers').catch(() => ({ suppliers: [] }));

        // If there's an edit index, update the existing supplier; otherwise, add a new one
        if (req.body.editIndex !== undefined && req.body.editIndex >= 0) {
            data.suppliers[req.body.editIndex] = req.body.supplier;
        } else {
            data.suppliers.push(req.body.supplier);
        }

        // Save the updated suppliers data back to the database
        const response = await db.insert({
            _id: 'suppliers',
            _rev: data._rev,
            suppliers: data.suppliers,
        });

        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving suppliers:', err);
        res.status(500).json({ error: 'Failed to save suppliers' });
    }
});

app.get('/suppliers-data', async (req, res) => {
    try {
        // Initialize the suppliers document if it doesn't exist
        await initializeDocument('suppliers', { suppliers: [] });

        // Fetch the suppliers document
        const data = await db.get('suppliers');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving suppliers:', err);
        res.status(500).json({ error: 'Failed to retrieve suppliers' });
    }
});

app.delete('/delete-supplier/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('suppliers').catch(() => null);
        if (data && data.suppliers && index >= 0 && index < data.suppliers.length) {
            data.suppliers.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Supplier not found' });
        }
    } catch (err) {
        console.error('Error deleting supplier:', err);
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
});

// Bill of Materials Routes
app.post('/save-materials', async (req, res) => {
    try {
        // Fetch the existing materials document
        const data = await db.get('materials').catch(() => ({ materials: [] }));

        // If there's an edit index, update the existing material; otherwise, add a new one
        if (req.body.editIndex !== undefined && req.body.editIndex >= 0) {
            data.materials[req.body.editIndex] = req.body.material;
        } else {
            data.materials.push(req.body.material);
        }

        // Save the updated materials data back to the database
        const response = await db.insert({
            _id: 'materials',
            _rev: data._rev,
            materials: data.materials,
        });

        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving materials:', err);
        res.status(500).json({ error: 'Failed to save materials' });
    }
});

app.get('/materials-data', async (req, res) => {
    try {
        // Initialize the materials document if it doesn't exist
        await initializeDocument('materials', { materials: [] });

        // Fetch the materials document
        const data = await db.get('materials');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving materials:', err);
        res.status(500).json({ error: 'Failed to retrieve materials' });
    }
});

app.delete('/delete-material/:index', async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const data = await db.get('materials').catch(() => null);
        if (data && data.materials && index >= 0 && index < data.materials.length) {
            data.materials.splice(index, 1);
            const response = await db.insert(data);
            res.status(200).json(response);
        } else {
            res.status(404).json({ error: 'Material not found' });
        }
    } catch (err) {
        console.error('Error deleting material:', err);
        res.status(500).json({ error: 'Failed to delete material' });
    }
});

// Risk Diagram Routes
app.post('/save-risk-diagram', async (req, res) => {
    try {
        const response = await saveDocument('risk-diagram', req.body);
        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving risk diagram:', err);
        res.status(500).json({ error: 'Failed to save risk diagram' });
    }
});

app.get('/risk-diagram-data', async (req, res) => {
    try {
        await initializeDocument('risk-diagram', { riskDiagram: {} });
        const data = await db.get('risk-diagram');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving risk diagram:', err);
        res.status(500).json({ error: 'Failed to retrieve risk diagram' });
    }
});

// Risk Reason Routes
app.post('/save-risk-reason', async (req, res) => {
    try {
        const { itemName, reason } = req.body;

        let riskReasons = await db.get('risk-reasons').catch(() => ({ reasons: {} }));

        riskReasons.reasons[itemName] = reason;

        const response = await db.insert({
            _id: 'risk-reasons',
            _rev: riskReasons._rev,
            reasons: riskReasons.reasons,
        });

        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving risk reason:', err);
        res.status(500).json({ error: 'Failed to save risk reason' });
    }
});

app.get('/risk-reasons-data', async (req, res) => {
    try {
        await initializeDocument('risk-reasons', { reasons: {} });
        const data = await db.get('risk-reasons');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving risk reasons:', err);
        res.status(500).json({ error: 'Failed to retrieve risk reasons' });
    }
});


// Save data classification
app.post('/save-data-classification', async (req, res) => {
    const { classification } = req.body;
    try {
        // Fetch existing document
        let existingDoc = await db.get('data-classification').catch(err => {
            if (err.statusCode === 404) return null;
            throw err;
        });

        if (existingDoc) {
            // Merge existing classification with new ones
            existingDoc.classification = { ...existingDoc.classification, ...classification };
            await db.insert(existingDoc);
        } else {
            // Insert new document if it doesn't exist
            await db.insert({ _id: 'data-classification', classification });
        }

        res.json({ message: 'Data classification saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to get data classification
app.get('/data-classification-data', async (req, res) => {
    try {
        const doc = await db.get('data-classification');
        res.json({ classification: doc.classification });
    } catch (err) {
        if (err.statusCode === 404) {
            res.json({ classification: {} }); // Return empty classification if not found
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// Save data types
app.post('/save-data-types', async (req, res) => {
    const { dataTypes } = req.body;
    try {
        // Fetch existing document
        let existingDoc = await db.get('data-types').catch(err => {
            if (err.statusCode === 404) return null;
            throw err;
        });

        if (existingDoc) {
            // Create a set of existing names for quick lookup
            const existingNames = new Set(existingDoc.dataTypes.map(dt => dt.name));
            
            // Filter out duplicates from the new data types
            const newDataTypes = dataTypes.filter(dt => !existingNames.has(dt.name));

            // Merge existing dataTypes with new non-duplicate ones
            existingDoc.dataTypes = [...existingDoc.dataTypes, ...newDataTypes];
            await db.insert(existingDoc);
        } else {
            // Insert new document if it doesn't exist
            await db.insert({ _id: 'data-types', dataTypes });
        }

        res.json({ message: 'Data types saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Route to get data types
app.get('/data-types-data', async (req, res) => {
    try {
        const doc = await db.get('data-types');
        res.json({ dataTypes: doc.dataTypes });
    } catch (err) {
        if (err.statusCode === 404) {
            res.json({ dataTypes: [] }); // Return empty array if not found
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});


// Vendor criticality Diagram Routes
app.post('/save-vendors-criticality-diagram', async (req, res) => {
    try {
        const { criticalityDiagram } = req.body;

        // Fetch the existing document or create a new one
        let existingDoc = await db.get('vendors-criticality-diagram').catch(() => null);

        if (existingDoc) {
            // Update the existing document
            existingDoc.criticalityDiagram = criticalityDiagram;
            await db.insert(existingDoc);
        } else {
            // Insert a new document if it doesn't exist
            await db.insert({ _id: 'vendors-criticality-diagram', criticalityDiagram });
        }

        res.status(200).json({ message: 'Vendor criticality diagram saved successfully' });
    } catch (err) {
        console.error('Error saving vendors criticality diagram:', err);
        res.status(500).json({ error: 'Failed to save vendors criticality diagram' });
    }
});

app.get('/vendors-criticality-diagram-data', async (req, res) => {
    try {
        // Initialize the vendors-criticality-diagram document if it doesn't exist
        await initializeDocument('vendors-criticality-diagram', { criticalityDiagram: {} });

        // Fetch the vendors-criticality-diagram document
        const data = await db.get('vendors-criticality-diagram');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving vendors criticality diagram:', err);
        res.status(500).json({ error: 'Failed to retrieve vendors criticality diagram' });
    }
});

// criticality Reason Routes
app.post('/save-criticality-reason', async (req, res) => {
    try {
        const { itemName, reason } = req.body;

        let criticalityReasons = await db.get('criticality-reasons').catch(() => ({ reasons: {} }));

        criticalityReasons.reasons[itemName] = reason;

        const response = await db.insert({
            _id: 'criticality-reasons',
            _rev: criticalityReasons._rev,
            reasons: criticalityReasons.reasons,
        });

        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving criticality reason:', err);
        res.status(500).json({ error: 'Failed to save criticality reason' });
    }
});

app.get('/criticality-reasons-data', async (req, res) => {
    try {
        await initializeDocument('criticality-reasons', { reasons: {} });
        const data = await db.get('criticality-reasons');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving criticality reasons:', err);
        res.status(500).json({ error: 'Failed to retrieve criticality reasons' });
    }
});

// Due Diligence Routes
app.post('/save-due-diligence', async (req, res) => {
    try {
        const { vendor, dueDiligence } = req.body;

        let dueDiligenceData = await db.get('due-diligence').catch(() => ({ dueDiligence: {} }));

        dueDiligenceData.dueDiligence[vendor] = dueDiligence;

        const response = await db.insert({
            _id: 'due-diligence',
            _rev: dueDiligenceData._rev,
            dueDiligence: dueDiligenceData.dueDiligence,
        });

        res.status(200).json(response);
    } catch (err) {
        console.error('Error saving due diligence:', err);
        res.status(500).json({ error: 'Failed to save due diligence' });
    }
});

app.get('/due-diligence-data', async (req, res) => {
    try {
        await initializeDocument('due-diligence', { dueDiligence: {} });
        const data = await db.get('due-diligence');
        res.status(200).json(data);
    } catch (err) {
        console.error('Error retrieving due diligence:', err);
        res.status(500).json({ error: 'Failed to retrieve due diligence' });
    }
});






// Serve static files from the "public" directory securely
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
    }
}));

// Serve the index.html file for any unknown paths
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server, binding it to localhost only
app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});

