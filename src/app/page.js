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
    setCurrentGoals((prev) => {
      const newValue = prev[name] > decrementValue ? prev[name] - decrementValue : 0;
      return { ...prev, [name]: newValue };
    });
    if (userId) {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        currentGoals: {
          ...currentGoals,
          [name]: currentGoals[name] > decrementValue ? currentGoals[name] - decrementValue : 0,
        },
      });
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
    setCurrentGoals((prev) => ({
      ...prev,
      [name]: editValue,
    }));
    if (userId) {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        currentGoals: {
          ...currentGoals,
          [name]: editValue,
        },
      });
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
          <div className='mb-3'>
            <h2 className='mb-1'>新規: 
              {editMode.newEntries ? (
                <span>
                  <input
                    type="number"
                    name="newEntries"
                    value={editValues.newEntries}
                    onChange={handleEditValueChange}
                    className='border ml-2 rounded-sm'
                  />
                  <button onClick={() => handleEditConfirm('newEntries')} className='ml-2 border py-1 px-2 rounded'>修正</button>
                </span>
              ) : (
                <span onClick={() => handleClickToEdit('newEntries')}>{currentGoals.newEntries}</span>
              )}
            </h2>
            <select name="newEntries" onChange={handleDecrementValueChange} value={decrementValues.newEntries}>
              {[...Array(21).keys()].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <button onClick={() => handleDecrement('newEntries')} className='ml-2 border py-1 px-2 rounded'>確定</button>
          </div>
          <div className='mb-3'>
            <h2 className='mb-1'>au/UQポイント: 
              {editMode.auUQPoints ? (
                <span>
                  <input
                    type="number"
                    name="auUQPoints"
                    value={editValues.auUQPoints}
                    onChange={handleEditValueChange}
                    className='border ml-2 rounded-sm'
                  />
                  <button onClick={() => handleEditConfirm('auUQPoints')} className='ml-2 border py-1 px-2 rounded'>修正</button>
                </span>
              ) : (
                <span onClick={() => handleClickToEdit('auUQPoints')}>{currentGoals.auUQPoints}</span>
              )}
            </h2>
            <select name="auUQPoints" onChange={handleDecrementValueChange} value={decrementValues.auUQPoints}>
              <option value={1}>1pt</option>
              <option value={4}>4pt</option>
              <option value={5}>5pt</option>
            </select>
            <button onClick={() => handleDecrement('auUQPoints')} className='ml-2 border py-1 px-2 rounded'>確定</button>
          </div>
          <div className='mb-3'>
            <h2 className='mb-1'>セルパ: 
              {editMode.serpa ? (
                <span>
                  <input
                    type="number"
                    name="serpa"
                    value={editValues.serpa}
                    onChange={handleEditValueChange}
                    className='border ml-2 rounded-sm'
                  />
                  <button onClick={() => handleEditConfirm('serpa')} className='ml-2 border py-1 px-2 rounded'>修正</button>
                </span>
              ) : (
                <span onClick={() => handleClickToEdit('serpa')}>{currentGoals.serpa}</span>
              )}
            </h2>
            <select name="serpa" onChange={handleDecrementValueChange} value={decrementValues.serpa}>
              {[...Array(21).keys()].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <button onClick={() => handleDecrement('serpa')} className='ml-2 border py-1 px-2 rounded'>確定</button>
          </div>
          <div className='mb-3'>
            <h2 className='mb-1'>セゾン: 
              {editMode.saison ? (
                <span>
                  <input
                    type="number"
                    name="saison"
                    value={editValues.saison}
                    onChange={handleEditValueChange}
                    className='border ml-2 rounded-sm'
                  />
                  <button onClick={() => handleEditConfirm('saison')} className='ml-2 border py-1 px-2 rounded'>修正</button>
                </span>
              ) : (
                <span onClick={() => handleClickToEdit('saison')}>{currentGoals.saison}</span>
              )}
            </h2>
            <select name="saison" onChange={handleDecrementValueChange} value={decrementValues.saison}>
              {[...Array(21).keys()].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <button onClick={() => handleDecrement('saison')} className='ml-2 border py-1 px-2 rounded'>確定</button>
          </div>
          <div className='mb-3'>
            <h2 className='mb-1'>総販: 
              {editMode.souhan ? (
                <span>
                  <input
                    type="number"
                    name="souhan"
                    value={editValues.souhan}
                    onChange={handleEditValueChange}
                    className='border ml-2 rounded-sm'
                  />
                  <button onClick={() => handleEditConfirm('souhan')} className='ml-2 border py-1 px-2 rounded'>修正</button>
                </span>
              ) : (
                <span onClick={() => handleClickToEdit('souhan')}>{currentGoals.souhan}</span>
              )}
            </h2>
            <select name="souhan" onChange={handleDecrementValueChange} value={decrementValues.souhan}>
              {[...Array(21).keys()].map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <button onClick={() => handleDecrement('souhan')} className='ml-2 border py-1 px-2 rounded'>確定</button>
          </div>
          <button onClick={handleReset} className='border rounded py-1 px-2'>リセット</button>
        </div>
      )}
    </div>
  );
}
