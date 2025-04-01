// Initialize localStorage data structures if they don't exist
if (!localStorage.getItem('students')) {
    localStorage.setItem('students', JSON.stringify([]));
}

if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify([]));
}

// DOM Elements
const loginForm = document.getElementById('loginForm');

// Event Listeners
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simple validation (in a real app, this would be more secure)
        if (email && password) {
            // Store basic user session
            localStorage.setItem('currentUser', JSON.stringify({ email }));
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Please enter both email and password');
        }
    });
}

// Utility Functions
function getStudents() {
    return JSON.parse(localStorage.getItem('students'));
}

function saveStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

function getAttendanceRecords() {
    return JSON.parse(localStorage.getItem('attendance'));
}

function saveAttendanceRecords(records) {
    localStorage.setItem('attendance', JSON.stringify(records));
}

function formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
}

// Navigation functions
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Dashboard functions
function updateDashboardStats() {
    const students = getStudents();
    const records = getAttendanceRecords();
    
    document.getElementById('studentCount').textContent = students.length;
    
    if (records.length > 0) {
        const latestRecord = records[records.length - 1];
        const presentCount = latestRecord.students.filter(s => s.present).length;
        const percentage = Math.round((presentCount / latestRecord.students.length) * 100);
        document.getElementById('attendancePercentage').textContent = `${percentage}%`;
    }
}

// Initialize dashboard if on dashboard page
if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('currentDate').textContent = formatDate();
        updateDashboardStats();
    });
}

// Student Management Functions
if (window.location.pathname.includes('students.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        renderStudentsTable();
        
        // Setup form submission
        document.getElementById('addStudentForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            addStudent();
        });
        
        // Setup search functionality
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            filterStudents(e.target.value);
        });
    });
}

function renderStudentsTable() {
    const students = getStudents();
    const tableBody = document.getElementById('studentsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.rollNumber}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editStudent(${index})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent(${index})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addStudent() {
    const name = document.getElementById('studentName').value;
    const rollNumber = document.getElementById('rollNumber').value;
    
    if (!name || !rollNumber) {
        alert('Please fill in all fields');
        return;
    }
    
    const students = getStudents();
    students.push({ name, rollNumber });
    saveStudents(students);
    
    // Reset form and hide modal
    document.getElementById('addStudentForm').reset();
    hideAddStudentModal();
    renderStudentsTable();
}

function filterStudents(searchTerm) {
    const students = getStudents();
    const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const tableBody = document.getElementById('studentsTable');
    tableBody.innerHTML = '';
    
    filtered.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.rollNumber}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editStudent(${index})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteStudent(${index})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showAddStudentModal() {
    document.getElementById('addStudentModal').classList.remove('hidden');
}

function hideAddStudentModal() {
    document.getElementById('addStudentModal').classList.add('hidden');
}

// Attendance Functions
if (window.location.pathname.includes('attendance.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Set default date to today
        document.getElementById('attendanceDate').value = formatDate();
        renderAttendanceList();
    });
}

function renderAttendanceList() {
    const students = getStudents();
    const tableBody = document.getElementById('attendanceList');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.rollNumber}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <select class="border rounded px-2 py-1">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                </select>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function submitAttendance() {
    const date = document.getElementById('attendanceDate').value;
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    const students = getStudents();
    const attendanceRecords = getAttendanceRecords();
    const attendanceList = document.getElementById('attendanceList');
    const rows = attendanceList.querySelectorAll('tr');
    
    const newRecord = {
        date,
        students: []
    };
    
    rows.forEach((row, index) => {
        const status = row.querySelector('select').value;
        newRecord.students.push({
            name: students[index].name,
            rollNumber: students[index].rollNumber,
            present: status === 'present'
        });
    });
    
    attendanceRecords.push(newRecord);
    saveAttendanceRecords(attendanceRecords);
    
    // Show success modal
    document.getElementById('successModal').classList.remove('hidden');
}

function hideSuccessModal() {
    document.getElementById('successModal').classList.add('hidden');
    window.location.href = 'dashboard.html';
}

// History Functions
if (window.location.pathname.includes('history.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        renderHistoryTable();
        
        // Set default date range (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        
        document.getElementById('startDate').value = formatDate(startDate);
        document.getElementById('endDate').value = formatDate(endDate);
    });
}

function renderHistoryTable(filteredRecords = null) {
    const records = filteredRecords || getAttendanceRecords();
    const tableBody = document.getElementById('historyTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    records.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((record, index) => {
        const presentCount = record.students.filter(s => s.present).length;
        const absentCount = record.students.length - presentCount;
        const percentage = Math.round((presentCount / record.students.length) * 100);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.students.length}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${presentCount}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${absentCount}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${percentage}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="viewDetails(${index})" class="text-blue-600 hover:text-blue-900">
                    <i class="fas fa-eye mr-1"></i> View
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function filterRecords() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }
    
    const records = getAttendanceRecords();
    const filtered = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
    });
    
    renderHistoryTable(filtered);
}

function viewDetails(index) {
    const records = getAttendanceRecords();
    const record = records[index];
    
    document.getElementById('modalTitle').textContent = `Attendance Details - ${record.date}`;
    const tableBody = document.getElementById('detailsTable');
    tableBody.innerHTML = '';
    
    record.students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.rollNumber}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${student.present ? 'Present' : 'Absent'}
                </span>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    document.getElementById('detailsModal').classList.remove('hidden');
}

function hideDetailsModal() {
    document.getElementById('detailsModal').classList.add('hidden');
}

function exportToCSV() {
    const records = getAttendanceRecords();
    if (records.length === 0) {
        alert('No attendance records to export');
        return;
    }
    
    let csv = 'Date,Total Students,Present,Absent,Percentage\n';
    
    records.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(record => {
        const presentCount = record.students.filter(s => s.present).length;
        const absentCount = record.students.length - presentCount;
        const percentage = Math.round((presentCount / record.students.length) * 100);
        
        csv += `${record.date},${record.students.length},${presentCount},${absentCount},${percentage}%\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'attendance_records.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Update dashboard stats with session count
function updateDashboardStats() {
    const students = getStudents();
    const records = getAttendanceRecords();
    
    document.getElementById('studentCount').textContent = students.length;
    document.getElementById('sessionCount').textContent = records.length;
    
    if (records.length > 0) {
        const latestRecord = records[records.length - 1];
        const presentCount = latestRecord.students.filter(s => s.present).length;
        const percentage = Math.round((presentCount / latestRecord.students.length) * 100);
        document.getElementById('attendancePercentage').textContent = `${percentage}%`;
        
        // Update recent attendance table
        const recentTable = document.getElementById('recentAttendance');
        if (recentTable) {
            recentTable.innerHTML = '';
            records.slice(-3).reverse().forEach(record => {
                const present = record.students.filter(s => s.present).length;
                const percentage = Math.round((present / record.students.length) * 100);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${present}/${record.students.length}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${percentage}%</td>
                `;
                recentTable.appendChild(row);
            });
        }
    }
}
