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

// Tabs: templates, history, stats, log (log is a hidden overlay-style tab)
function switchTab(tab) {
  const tabs = ['templates', 'history', 'stats'];
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', tabs[i] === tab);
  });
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + tab).classList.add('active');

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
  document.getElementById('workout-name').value = currentWorkout.name;
  document.getElementById('exercises-container').innerHTML = '';
  exCounter = 0;
  setCounters = {};
  timerStart = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  document.getElementById('nav-sub').textContent = 'Workout in progress';
  updateBanner();
  addExercise();
  switchTab('log');
}

function startFromTemplate(tplName) {
  startWorkout(tplName);
  document.getElementById('exercises-container').innerHTML = '';
  exCounter = 0;
  setCounters = {};
  const exs = TEMPLATES[tplName] || [];
  exs.forEach(name => addExercise(name));
}

function startSavedTemplate(templateName) {
  const template = savedTemplates[templateName];
  if (!template) return;

  startWorkout(templateName);
  const container = document.getElementById('exercises-container');
  container.innerHTML = '';
  exCounter = 0;
  setCounters = {};

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
      newestRow.querySelector('input[id$="-reps"]').value = set.reps;
      newestRow.querySelector('input[id$="-weight"]').value = set.weight;
      newestRow.querySelector('select').value = set.unit || 'lbs';
    });
  });
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - timerStart) / 1000);
  const m = Math.floor(elapsed / 60), s = elapsed % 60;
  const formatted = m + ':' + String(s).padStart(2, '0');
  document.getElementById('timer-display').textContent = formatted;
  document.getElementById('banner-timer').textContent = formatted;
}

function updateBanner() {
  const banner = document.getElementById('active-workout-banner');
  if (currentWorkout) {
    banner.style.display = 'block';
    document.getElementById('banner-name').textContent = document.getElementById('workout-name').value || 'Workout';
  } else {
    banner.style.display = 'none';
  }
}

function addExercise(namePreset) {
  const id = 'ex-' + (exCounter++);
  const container = document.getElementById('exercises-container');
  const div = document.createElement('div');
  div.className = 'exercise-block';
  div.id = id;
  div.innerHTML = `
    <div class="exercise-header">
      <input type="text" class="exercise-name-input" placeholder="Exercise name" value="${namePreset || ''}" id="${id}-name" oninput="updateBanner()">
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

function closeModal(e) {
  if (!e || e.target === document.getElementById('exercise-modal')) {
    document.getElementById('exercise-modal').classList.remove('open');
  }
}

function filterExercises() {
  const q = document.getElementById('exercise-search').value.toLowerCase();
  const list = document.getElementById('exercise-list');
  const filtered = EXERCISES.filter(e => e.name.toLowerCase().includes(q) || e.muscles.toLowerCase().includes(q));
  list.innerHTML = filtered.map(e => `
    <div onclick="pickExercise('${e.name}')" class="exercise-picker-row">
      <div>
        <div class="exercise-picker-name">${e.name}</div>
        <div class="exercise-picker-muscles">${e.muscles}</div>
      </div>
      <span class="exercise-picker-add">+</span>
    </div>
  `).join('');
}

function pickExercise(name) {
  if (currentExerciseTarget) {
    document.getElementById(currentExerciseTarget + '-name').value = name === 'Custom Exercise' ? '' : name;
  }
  document.getElementById('exercise-modal').classList.remove('open');
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
      if (reps || weight) sets.push({ reps: reps || '0', weight: weight || '0', unit });
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
  alert('Template saved!');
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
  currentWorkout = null;
  document.getElementById('nav-sub').textContent = 'Track your training';
  updateBanner();
  switchTab('templates');
}

function renderHistory() {
  const container = document.getElementById('history-list');
  if (workouts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏋️</div>
        <div class="empty-title">No workouts yet</div>
        <div class="empty-sub">Start a workout from the Templates tab</div>
      </div>`;
    return;
  }
  container.innerHTML = workouts.map(w => `
    <div class="history-card">
      <div class="history-date">${new Date(w.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}</div>
      <div class="history-name">${w.name}</div>
      <div class="history-meta">
        <span>💪 ${w.exercises.length} exercise${w.exercises.length !== 1 ? 's' : ''}</span>
        <span>⏱ ${Math.floor(w.duration / 60)}m ${w.duration % 60}s</span>
        <span>🔢 ${w.exercises.reduce((a, e) => a + e.sets.length, 0)} sets</span>
      </div>
      <div class="history-exercises">
        ${w.exercises.map(e => `<span class="template-chip">${e.name}</span>`).join('')}
      </div>
      <button onclick="deleteWorkout(${w.id})" class="btn-danger" style="margin-top:12px; width:100%;">Delete</button>
    </div>
  `).join('');
}

function deleteWorkout(id) {
  if (!confirm('Delete this workout?')) return;
  workouts = workouts.filter(w => w.id !== id);
  localStorage.setItem('lift_workouts', JSON.stringify(workouts));
  renderHistory();
}

function renderSavedTemplates() {
  const container = document.getElementById('saved-templates');
  const names = Object.keys(savedTemplates);
  if (names.length === 0) {
    container.innerHTML = `<div class="empty-state-inline">No custom templates yet.<br>Finish a workout and save it as a template.</div>`;
    return;
  }
  container.innerHTML = names.map(name => `
    <div class="template-card">
      <div class="template-card-name">${name}</div>
      <div style="margin:8px 0;">${savedTemplates[name].map(ex => `<span class="template-chip">${ex.name}</span>`).join('')}</div>
      <div class="template-actions">
        <button class="btn-secondary" onclick="startSavedTemplate('${name}')">▶ Start</button>
        <button class="btn-danger" onclick="deleteTemplate('${name}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function deleteTemplate(name) {
  if (!confirm(`Delete template "${name}"?`)) return;
  delete savedTemplates[name];
  localStorage.setItem('lift_templates', JSON.stringify(savedTemplates));
  renderSavedTemplates();
}

function calcStreak() {
  if (workouts.length === 0) return 0;
  const days = [...new Set(workouts.map(w => new Date(w.date).toDateString()))];
  // Sort descending
  days.sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let check = new Date();
  check.setHours(0, 0, 0, 0);
  for (const day of days) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((check - d) / 86400000);
    if (diff === 0 || diff === 1) {
      streak++;
      check = d;
    } else {
      break;
    }
  }
  return streak;
}

function renderStats() {
  document.getElementById('stat-total').textContent = workouts.length;
  document.getElementById('stat-streak').textContent = calcStreak();

  let totalSets = 0, totalVol = 0;
  const freqMap = {};
  workouts.forEach(w => w.exercises.forEach(e => {
    e.sets.forEach(s => {
      totalSets++;
      totalVol += (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0);
    });
    freqMap[e.name] = (freqMap[e.name] || 0) + 1;
  }));

  document.getElementById('stat-sets').textContent = totalSets;
  document.getElementById('stat-volume').textContent = Math.round(totalVol).toLocaleString();

  // Exercise frequency chart
  const freqEl = document.getElementById('exercise-freq');
  const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (sorted.length === 0) {
    freqEl.innerHTML = `<div class="empty-state-inline">Complete workouts to see your most-used exercises.</div>`;
    return;
  }
  const max = sorted[0][1];
  freqEl.innerHTML = sorted.map(([name, count]) => `
    <div class="freq-row">
      <div class="freq-label">${name}</div>
      <div class="freq-bar-wrap">
        <div class="freq-bar" style="width:${Math.round((count / max) * 100)}%"></div>
      </div>
      <div class="freq-count">${count}x</div>
    </div>
  `).join('');
}

// Initial render
renderSavedTemplates();
renderStats();
