"use client"
import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export default function Home() {
  const [initialGoals, setInitialGoals] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [currentGoals, setCurrentGoals] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [decrementValues, setDecrementValues] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [editMode, setEditMode] = useState({
    newEntries: false,
    auUQPoints: false,
    serpa: false,
    saison: false,
    souhan: false,
  });
  const [editValues, setEditValues] = useState({
    newEntries: 0,
    auUQPoints: 0,
    serpa: 0,
    saison: 0,
    souhan: 0,
  });
  const [userId, setUserId] = useState(null);
  const [isInitialSet, setIsInitialSet] = useState(false);
  const [history, setHistory] = useState({
    newEntries: [],
    auUQPoints: [],
    serpa: [],
    saison: [],
    souhan: [],
  });

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setInitialGoals(data.initialGoals);
        setCurrentGoals(data.currentGoals);
        setEditValues(data.currentGoals); // initialize edit values
        setUserId(doc.id);
        setIsInitialSet(true);
      });
    };

    fetchUserData();
  }, []);

  // Handle initial goals change
  const handleInitialGoalsChange = (event) => {
    const { name, value } = event.target;
    setInitialGoals((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle setting initial goals
  const handleSetInitialGoals = async () => {
    setCurrentGoals(initialGoals);
    const docRef = await addDoc(collection(db, 'users'), {
      initialGoals: initialGoals,
      currentGoals: initialGoals,
    });
    setUserId(docRef.id);
    setIsInitialSet(true);
  };

  // Handle decrement value change
  const handleDecrementValueChange = (event) => {
    const { name, value } = event.target;
    setDecrementValues((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle decrement
  const handleDecrement = async (name) => {
    const decrementValue = decrementValues[name];
    const newGoals = { ...currentGoals, [name]: currentGoals[name] > decrementValue ? currentGoals[name] - decrementValue : 0 };
    
    setHistory((prev) => ({
      ...prev,
      [name]: [...prev[name], currentGoals[name]], // Save current value before decrement
    }));
    
    setCurrentGoals(newGoals);
    
    if (userId) {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { currentGoals: newGoals });
    }
  };

  // Handle edit value change
  const handleEditValueChange = (event) => {
    const { name, value } = event.target;
    setEditValues((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle edit confirmation
  const handleEditConfirm = async (name) => {
    const editValue = editValues[name];
    const newGoals = { ...currentGoals, [name]: editValue };

    setHistory((prev) => ({
      ...prev,
      [name]: [...prev[name], currentGoals[name]], // Save current value before edit
    }));

    setCurrentGoals(newGoals);

    if (userId) {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, { currentGoals: newGoals });
    }
    setEditMode((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  // Handle click to edit
  const handleClickToEdit = (name) => {
    setEditMode((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // Calculate percentage
  const calculatePercentage = (current, initial) => {
    if (initial === 0) return 0;
    return ((initial - current) / initial) * 100;
  };

  // Handle reset
  const handleReset = async () => {
    if (userId) {
      await deleteDoc(doc(db, 'users', userId));
      setInitialGoals({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setCurrentGoals({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setDecrementValues({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setEditValues({
        newEntries: 0,
        auUQPoints: 0,
        serpa: 0,
        saison: 0,
        souhan: 0,
      });
      setEditMode({
        newEntries: false,
        auUQPoints: false,
        serpa: false,
        saison: false,
        souhan: false,
      });
      setUserId(null);
      setIsInitialSet(false);
    }
  };

  // Handle undo last change
  const handleUndo = (name) => {
    const lastValue = history[name].pop();
    if (lastValue !== undefined) {
      const newGoals = { ...currentGoals, [name]: lastValue };
      setCurrentGoals(newGoals);

      if (userId) {
        const userDoc = doc(db, 'users', userId);
        updateDoc(userDoc, { currentGoals: newGoals });
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {!isInitialSet ? (
        <div>
          <h1>目標を設定してください</h1>
          <div className='mb-4'>
            <label>新規:</label>
            <input
              type="number"
              name="newEntries"
              value={initialGoals.newEntries}
              onChange={handleInitialGoalsChange}
              className='border ml-2 rounded-sm'
            />
          </div>
          <div className='mb-4'>
            <label>au/UQポイント:</label>
            <input
              type="number"
              name="auUQPoints"
              value={initialGoals.auUQPoints}
              onChange={handleInitialGoalsChange}
              className='border ml-2 rounded-sm'
            />
          </div>
          <div className='mb-4'>
            <label>セルパ:</label>
            <input
              type="number"
              name="serpa"
              value={initialGoals.serpa}
              onChange={handleInitialGoalsChange}
              className='border ml-2 rounded-sm'
            />
          </div>
          <div className='mb-4'>
            <label>セゾン:</label>
            <input
              type="number"
              name="saison"
              value={initialGoals.saison}
              onChange={handleInitialGoalsChange}
              className='border ml-2 rounded-sm'
            />
          </div>
          <div className='mb-4'>
            <label>総販:</label>
            <input
              type="number"
              name="souhan"
              value={initialGoals.souhan}
              onChange={handleInitialGoalsChange}
              className='border ml-2 rounded-sm'
            />
          </div>
          <button onClick={handleSetInitialGoals} className='border py-2 px-4 rounded'>設定</button>
        </div>
      ) : (
        <div>
          <h1 className='mb-4'>目標ポイントの残数</h1>
          {['newEntries', 'auUQPoints', 'serpa', 'saison', 'souhan'].map((goal) => (
            <div className='mb-3' key={goal}>
              <h2 className='mb-1'>
                {goal === 'newEntries' && '新規'}
                {goal === 'auUQPoints' && 'au/UQポイント'}
                {goal === 'serpa' && 'セルパ'}
                {goal === 'saison' && 'セゾン'}
                {goal === 'souhan' && '総販'}
                : 
                {editMode[goal] ? (
                  <span>
                    <input
                      type="number"
                      name={goal}
                      value={editValues[goal]}
                      onChange={handleEditValueChange}
                      className='border ml-2 rounded-sm'
                    />
                    <button onClick={() => handleEditConfirm(goal)} className='ml-2 border py-1 px-2 rounded'>修正</button>
                  </span>
                ) : (
                  <span onClick={() => handleClickToEdit(goal)}>
                    {currentGoals[goal]} / {initialGoals[goal]}
                  </span>
                )}
                <span>（{calculatePercentage(currentGoals[goal], initialGoals[goal]).toFixed(2)}%）</span>
              </h2>
              <select name={goal} onChange={handleDecrementValueChange} value={decrementValues[goal]}>
                {[...Array(21).keys()].map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
              <button onClick={() => handleDecrement(goal)} className='ml-2 border py-1 px-2 rounded'>確定</button>
              <button onClick={() => handleUndo(goal)} className='ml-2 border py-1 px-2 rounded'>元に戻す</button>
            </div>
          ))}
          <button onClick={handleReset} className='border rounded py-1 px-2'>リセット</button>
        </div>
      )}
    </div>
  );
}
