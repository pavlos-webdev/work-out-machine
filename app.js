const EXERCISES = [
  {name:'Bench Press', muscles:'Chest · Triceps'},
  {name:'Incline Bench Press', muscles:'Upper Chest'},
  {name:'Dumbbell Fly', muscles:'Chest'},
  {name:'Push-up', muscles:'Chest · Triceps'},
  {name:'Cable Crossover', muscles:'Chest'},
  {name:'Overhead Press', muscles:'Shoulders · Triceps'},
  {name:'Lateral Raise', muscles:'Shoulders'},
  {name:'Front Raise', muscles:'Shoulders'},
  {name:'Arnold Press', muscles:'Shoulders'},
  {name:'Tricep Pushdown', muscles:'Triceps'},
  {name:'Skull Crusher', muscles:'Triceps'},
  {name:'Tricep Dip', muscles:'Triceps'},
  {name:'Pull-up', muscles:'Back · Biceps'},
  {name:'Barbell Row', muscles:'Back'},
  {name:'Dumbbell Row', muscles:'Back'},
  {name:'Lat Pulldown', muscles:'Back'},
  {name:'Seated Cable Row', muscles:'Back'},
  {name:'Face Pull', muscles:'Rear Delts'},
  {name:'Barbell Curl', muscles:'Biceps'},
  {name:'Dumbbell Curl', muscles:'Biceps'},
  {name:'Hammer Curl', muscles:'Biceps'},
  {name:'Preacher Curl', muscles:'Biceps'},
  {name:'Squat', muscles:'Quads · Glutes'},
  {name:'Leg Press', muscles:'Quads'},
  {name:'Romanian Deadlift', muscles:'Hamstrings · Glutes'},
  {name:'Deadlift', muscles:'Full Body'},
  {name:'Leg Curl', muscles:'Hamstrings'},
  {name:'Leg Extension', muscles:'Quads'},
  {name:'Hip Thrust', muscles:'Glutes'},
  {name:'Calf Raise', muscles:'Calves'},
  {name:'Lunge', muscles:'Quads · Glutes'},
  {name:'Plank', muscles:'Core'},
  {name:'Crunch', muscles:'Core'},
  {name:'Cable Crunch', muscles:'Core'},
  {name:'Russian Twist', muscles:'Core'},
  {name:'Custom Exercise', muscles:'Custom'},
];
 
const TEMPLATES = {
  'Push Day': ['Bench Press','Overhead Press','Incline Bench Press','Lateral Raise','Tricep Pushdown'],
  'Pull Day': ['Pull-up','Barbell Row','Lat Pulldown','Barbell Curl','Face Pull'],
  'Leg Day': ['Squat','Romanian Deadlift','Leg Press','Leg Curl','Calf Raise'],
};
 
let savedTemplates = JSON.parse(localStorage.getItem('lift_templates') || '{}');
let workouts = JSON.parse(localStorage.getItem('lift_workouts') || '[]');
let currentWorkout = null;
let timerInterval = null;
let timerStart = null;
let currentExerciseTarget = null;
let exCounter = 0;
let setCounters = {};

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  
  // Adjusted order to match index.html: Log, History, Templates, Stats
  const tabs = ['log', 'history', 'templates', 'stats'];
  const index = tabs.indexOf(tab);
  
  if (index !== -1) {
    document.querySelectorAll('.tab-btn')[index].classList.add('active');
    document.getElementById('screen-' + tab).classList.add('active');
  }

  if (tab === 'history') renderHistory();
  if (tab === 'stats') renderStats();
  if (tab === 'templates') renderSavedTemplates();
}
 
function startWorkout(name) {
  currentWorkout = {
    name: name || 'Morning Workout',
    date: new Date().toISOString(),
    exercises: []
  };
  switchTab('log');
  document.getElementById('workout-name').value = currentWorkout.name;
  document.getElementById('log-idle').style.display = 'none';
  document.getElementById('log-active').style.display = 'block';
  document.getElementById('exercises-container').innerHTML = '';
  timerStart = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  document.getElementById('nav-sub').textContent = 'Workout in progress';
  addExercise();
}
 
function startFromTemplate(tplName) {
  startWorkout(tplName);
  document.getElementById('exercises-container').innerHTML = '';
  const exs = TEMPLATES[tplName] || [];
  exs.forEach(name => addExercise(name));
}

function startSavedTemplate(templateName) {
  const template = savedTemplates[templateName];
  if (!template) return;

  startWorkout(templateName);
  const container = document.getElementById('exercises-container');
  container.innerHTML = '';

  template.forEach(exercise => {
    addExercise(exercise.name);
    const blocks = document.querySelectorAll('.exercise-block');
    const newest = blocks[blocks.length - 1];
    const exId = newest.id;
    const setsContainer = document.getElementById(exId + '-sets');
    setsContainer.innerHTML = '';
    setCounters[exId] = 0;

    exercise.sets.forEach(set => {
      addSet(exId);
      const rows = setsContainer.querySelectorAll('.set-row');
      const newestRow = rows[rows.length - 1];
      newestRow.querySelector(`input[id$="-reps"]`).value = set.reps;
      newestRow.querySelector(`input[id$="-weight"]`).value = set.weight;
      newestRow.querySelector('select').value = set.unit || 'lbs';
    });
  });
}
 
function updateTimer() {
  const elapsed = Math.floor((Date.now() - timerStart) / 1000);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  document.getElementById('timer-display').textContent = m + ':' + String(s).padStart(2,'0');
}
 
function addExercise(namePreset) {
  const id = 'ex-' + (exCounter++);
  const container = document.getElementById('exercises-container');
  const div = document.createElement('div');
  div.className = 'exercise-block';
  div.id = id;
  div.innerHTML = `
    <div class="exercise-header">
      <input type="text" class="exercise-name-input" placeholder="Exercise name" value="${namePreset || ''}" id="${id}-name">
      <button class="btn-secondary" onclick="openExercisePicker('${id}')">Browse</button>
      <button class="btn-danger" onclick="removeExercise('${id}')">✕</button>
    </div>
    <div class="sets-table">
      <div class="sets-header">
        <span>Set</span><span>Reps</span><span>Weight</span><span>Unit</span><span></span>
      </div>
      <div id="${id}-sets"></div>
    </div>
    <div class="add-set-row">
      <button class="add-set-btn" onclick="addSet('${id}')">+ Add Set</button>
    </div>
  `;
  container.appendChild(div);
  addSet(id);
}
 
function removeExercise(id) { document.getElementById(id).remove(); }
 
function addSet(exId) {
  if (!setCounters[exId]) setCounters[exId] = 0;
  setCounters[exId]++;
  const num = setCounters[exId];
  const setId = exId + '-set-' + num;
  const container = document.getElementById(exId + '-sets');
  const div = document.createElement('div');
  div.className = 'set-row';
  div.id = setId;
  div.innerHTML = `
    <div class="set-number">${num}</div>
    <input type="number" placeholder="—" id="${setId}-reps">
    <input type="number" placeholder="—" id="${setId}-weight">
    <select id="${setId}-unit">
      <option>lbs</option><option>kg</option>
    </select>
    <button class="remove-set-btn" onclick="removeSet('${setId}', '${exId}')">−</button>
  `;
  container.appendChild(div);
  renumberSets(exId);
}
 
function removeSet(setId, exId) {
  const el = document.getElementById(setId);
  if (el) el.remove();
  renumberSets(exId);
}
 
function renumberSets(exId) {
  const rows = document.querySelectorAll(`#${exId}-sets .set-row`);
  rows.forEach((row, i) => {
    row.querySelector('.set-number').textContent = i + 1;
  });
}
 
function openExercisePicker(exId) {
  currentExerciseTarget = exId;
  document.getElementById('exercise-search').value = '';
  filterExercises();
  document.getElementById('exercise-modal').classList.add('open');
}
 
function closeModal() { document.getElementById('exercise-modal').classList.remove('open'); }
 
function filterExercises() {
  const q = document.getElementById('exercise-search').value.toLowerCase();
  const list = document.getElementById('exercise-list');
  const filtered = EXERCISES.filter(e => e.name.toLowerCase().includes(q) || e.muscles.toLowerCase().includes(q));
  list.innerHTML = filtered.map(e => `
    <div onclick="pickExercise('${e.name}')" style="padding: 12px 4px; display: flex; align-items: center; justify-content: space-between; border-bottom: 0.5px solid var(--separator); cursor: pointer;">
      <div>
        <div style="font-size: 16px; font-weight: 500;">${e.name}</div>
        <div style="font-size: 12px; color: var(--text3);">${e.muscles}</div>
      </div>
      <span style="color: var(--ios-blue); font-size: 20px;">+</span>
    </div>
  `).join('');
}
 
function pickExercise(name) {
  if (currentExerciseTarget) {
    document.getElementById(currentExerciseTarget + '-name').value = name === 'Custom Exercise' ? '' : name;
  }
  closeModal();
}
 
function collectWorkoutData() {
  const name = document.getElementById('workout-name').value || 'Workout';
  const exercises = [];
  document.querySelectorAll('.exercise-block').forEach(block => {
    const exName = block.querySelector('.exercise-name-input').value || 'Unknown Exercise';
    const sets = [];
    block.querySelectorAll('.set-row').forEach(row => {
      const reps = row.querySelector('input[id$="-reps"]')?.value;
      const weight = row.querySelector('input[id$="-weight"]')?.value;
      const unit = row.querySelector('select')?.value || 'lbs';
      if(reps || weight) sets.push({ reps: reps || '0', weight: weight || '0', unit });
    });
    if (sets.length > 0) exercises.push({ name: exName, sets });
  });
  return { name, exercises };
}

function saveCurrentAsTemplate() {
  const { name, exercises } = collectWorkoutData();
  if (exercises.length === 0) return alert('Add exercises first.');
  const templateName = prompt('Template name:', name);
  if (!templateName) return;
  savedTemplates[templateName] = exercises;
  localStorage.setItem('lift_templates', JSON.stringify(savedTemplates));
  renderSavedTemplates();
}
 
function finishWorkout() {
  const { name, exercises } = collectWorkoutData();
  if (exercises.length === 0) return alert('Add exercises first.');
  const workout = {
    id: Date.now(),
    name,
    date: new Date().toISOString(),
    duration: Math.floor((Date.now() - timerStart) / 1000),
    exercises
  };
  workouts.unshift(workout);
  localStorage.setItem('lift_workouts', JSON.stringify(workouts));
  endSession();
  switchTab('history');
}
 
function cancelWorkout() {
  if (confirm('Cancel this workout?')) endSession();
}
 
function endSession() {
  clearInterval(timerInterval);
  document.getElementById('log-idle').style.display = 'block';
  document.getElementById('log-active').style.display = 'none';
  document.getElementById('nav-sub').textContent = 'Track your training';
  currentWorkout = null;
}
 
function renderHistory() {
  const container = document.getElementById('history-list');
  if (workouts.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">🏋️</div><div class="empty-title">No history</div></div>`;
    return;
  }
  container.innerHTML = workouts.map((w, i) => `
    <div class="history-card">
      <div style="font-size:12px; color:var(--ios-blue); font-weight:700;">${new Date(w.date).toLocaleDateString()}</div>
      <div style="font-size:18px; font-weight:700; margin:4px 0;">${w.name}</div>
      <div style="display:flex; gap:8px; font-size:12px; color:var(--text3);">
        <span>💪 ${w.exercises.length} Exercises</span>
        <span>⏱ ${Math.floor(w.duration/60)}m</span>
      </div>
      <button onclick="deleteWorkout(${w.id})" class="btn-danger" style="margin-top:12px; width:100%;">Delete</button>
    </div>
  `).join('');
}

function deleteWorkout(id) {
  workouts = workouts.filter(w => w.id !== id);
  localStorage.setItem('lift_workouts', JSON.stringify(workouts));
  renderHistory();
}

function renderSavedTemplates() {
  const container = document.getElementById('saved-templates');
  const names = Object.keys(savedTemplates);
  if (names.length === 0) {
    container.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text3);">No custom templates.</div>`;
    return;
  }
  container.innerHTML = names.map(name => `
    <div class="template-card">
      <div style="font-weight:700; font-size:17px;">${name}</div>
      <div style="margin:8px 0;">${savedTemplates[name].map(ex => `<span class="template-chip">${ex.name}</span>`).join('')}</div>
      <div class="template-actions">
        <button class="btn-secondary" onclick="startSavedTemplate('${name}')">Start</button>
        <button class="btn-danger" onclick="deleteTemplate('${name}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function deleteTemplate(name) {
  delete savedTemplates[name];
  localStorage.setItem('lift_templates', JSON.stringify(savedTemplates));
  renderSavedTemplates();
}

function renderStats() {
  document.getElementById('stat-total').textContent = workouts.length;
  let totalSets = 0, totalVol = 0;
  workouts.forEach(w => w.exercises.forEach(e => e.sets.forEach(s => {
    totalSets++;
    totalVol += (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0);
  })));
  document.getElementById('stat-sets').textContent = totalSets;
  document.getElementById('stat-volume').textContent = Math.round(totalVol).toLocaleString();
}

// Initial load
renderSavedTemplates();
renderStats();