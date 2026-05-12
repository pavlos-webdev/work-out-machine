const startBtn = document.getElementById('startBtn');
const workoutSection = document.getElementById('workoutSection');
const addExerciseBtn = document.getElementById('addExerciseBtn');
const exerciseContainer = document.getElementById('exerciseContainer');
const finishBtn = document.getElementById('finishBtn');
const cancelBtn = document.getElementById('cancelBtn');
const timerEl = document.getElementById('timer');
const historyEl = document.getElementById('history');
const subtitle = document.getElementById('subtitle');

let timerInterval = null;
let startTime = null;

let workouts = [];

try {
  workouts = JSON.parse(localStorage.getItem('lift_workouts')) || [];
} catch (err) {
  workouts = [];
  localStorage.removeItem('lift_workouts');
}

renderHistory();

startBtn.addEventListener('click', () => {
  workoutSection.classList.remove('hidden');
  subtitle.textContent = 'Workout in progress';

  startTime = Date.now();

  clearInterval(timerInterval);

  timerInterval = setInterval(updateTimer, 1000);

  exerciseContainer.innerHTML = '';

  addExercise();
});

addExerciseBtn.addEventListener('click', addExercise);

cancelBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  workoutSection.classList.add('hidden');
  subtitle.textContent = 'Track your workouts';
});

finishBtn.addEventListener('click', () => {
  const workoutName = document.getElementById('workoutName').value || 'Workout';

  const exercises = [];

  document.querySelectorAll('.exercise').forEach(exercise => {
    const name = exercise.querySelector('.exercise-name').value || 'Exercise';

    const sets = [];

    exercise.querySelectorAll('.set-row').forEach(row => {
      const inputs = row.querySelectorAll('input');

      sets.push({
        reps: inputs[0].value || 0,
        weight: inputs[1].value || 0
      });
    });

    exercises.push({
      name,
      sets
    });
  });

  workouts.unshift({
    id: Date.now(),
    name: workoutName,
    exercises
  });

  localStorage.setItem('lift_workouts', JSON.stringify(workouts));

  clearInterval(timerInterval);

  workoutSection.classList.add('hidden');

  subtitle.textContent = 'Track your workouts';

  renderHistory();
});

function updateTimer() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  timerEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
}

function addExercise() {
  const div = document.createElement('div');

  div.className = 'exercise';

  div.innerHTML = `
    <input
      class="exercise-name"
      type="text"
      placeholder="Exercise name"
    />

    <div class="set-row">
      <input type="number" placeholder="Reps" />
      <input type="number" placeholder="Weight" />
    </div>
  `;

  exerciseContainer.appendChild(div);
}
function saveTemplate(name, exercises) {

  const templates =
    JSON.parse(
      localStorage.getItem('lift_templates') || '[]'
    );

  templates.push({
    id: Date.now(),
    name,
    exercises
  });

  localStorage.setItem(
  'lift_workouts',
  JSON.stringify(workouts)
);

const shouldSave =
  confirm(
    'Save this workout as a reusable template?'
  );

if (shouldSave) {
  saveTemplate(workoutName, exercises);
}

  renderTemplates();
}

function renderTemplates() {

  const container =
    document.getElementById('templates');

  const templates =
    JSON.parse(
      localStorage.getItem('lift_templates') || '[]'
    );

  if (templates.length === 0) {

    container.innerHTML = `
      <p style="color:#666;">
        No saved workouts yet.
      </p>
    `;

    return;
  }

  container.innerHTML =
    templates.map(template => {

      return `
        <div class="history-item">

          <strong>${template.name}</strong>

          <div style="margin-top:6px;">
            ${template.exercises.length} exercises
          </div>

          <button
            class="primary-btn"
            style="margin-top:12px;"
            onclick="loadTemplate(${template.id})"
          >
            Start Workout
          </button>

        </div>
      `;
    }).join('');
}

window.loadTemplate = function(id) {

  const templates =
    JSON.parse(
      localStorage.getItem('lift_templates') || '[]'
    );

  const template =
    templates.find(t => t.id === id);

  if (!template) return;

  workoutSection.classList.remove('hidden');

  subtitle.textContent =
    'Workout in progress';

  document.getElementById('workoutName').value =
    template.name;

  exerciseContainer.innerHTML = '';

  template.exercises.forEach(exercise => {

    const div =
      document.createElement('div');

    div.className = 'exercise';

    div.innerHTML = `
      <input
        class="exercise-name"
        type="text"
        value="${exercise.name}"
      />
    `;

    exercise.sets.forEach(set => {

      const row =
        document.createElement('div');

      row.className = 'set-row';

      row.innerHTML = `
        <input
          type="number"
          placeholder="Reps"
          value="${set.reps}"
        />

        <input
          type="number"
          placeholder="Weight"
          value="${set.weight}"
        />
      `;

      div.appendChild(row);
    });

    exerciseContainer.appendChild(div);
  });

  startTime = Date.now();

  clearInterval(timerInterval);

  timerInterval =
    setInterval(updateTimer, 1000);
}

function renderHistory() {
  if (workouts.length === 0) {
    historyEl.innerHTML = '<p>No workouts yet.</p>';
    return;
  }

  historyEl.innerHTML = workouts.map(workout => {
    const totalSets = workout.exercises.reduce((acc, ex) => {
      return acc + ex.sets.length;
    }, 0);

    return `
      <div class="history-item">
        <strong>${workout.name}</strong>
        <div>${workout.exercises.length} exercises</div>
        <div>${totalSets} sets</div>
      </div>
    `;
  }).join('');
}
renderTemplates();
renderHistory();