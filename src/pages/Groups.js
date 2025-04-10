import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import './Groups.css';
const username = localStorage.getItem('username');

console.log('Logged in as:', username); // ✅ Add this for debugging
const Groups = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [groups, setGroups] = useState([]);
  const [expandedGroupIndex, setExpandedGroupIndex] = useState(null);
  const username = localStorage.getItem('username'); // logged-in user

  const handleOpenModal = (type) => {
    setMode(type);
    setModalOpen(true);
    setGroupName('');
    setGroupDesc('');
    setJoinCode('');
  };

  const handleCloseModal = () => setModalOpen(false);

  const generateGroupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  };

  const handleSubmit = async () => {
    if (mode === 'create') {
      const code = generateGroupCode();

      const groupPayload = {
        name: groupName,
        description: groupDesc,
        code: code,
        createdBy: username,
      };

      try {
        const res = await fetch('http://localhost:3500/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groupPayload),
        });

        const data = await res.json();
        if (res.ok) {
          const newGroup = { ...groupPayload, members: [username] };
          setGroups((prev) => [...prev, newGroup]);
          alert(`Group "${groupName}" created!\nCode: ${code}`);
        } else {
          alert('Failed to create group: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong. Try again.');
      }
    } else if (mode === 'join') {
      alert(`Attempting to join group with code: ${joinCode}`);
    }

    handleCloseModal();
  };

  const toggleGroupDetails = (index) => {
    setExpandedGroupIndex(expandedGroupIndex === index ? null : index);
  };

  return (
    <>
      <NavBar />
      <div className="groups-container">
        <div className="header-title">
          <h1>GROUPS</h1>
        </div>

        <div className="groups-button-group">
          <Button label="+ Create Group" onClick={() => handleOpenModal('create')} />
          <Button label="Join Group" onClick={() => handleOpenModal('join')} />
        </div>

        {modalOpen && (
          <Modal onSubmit={handleSubmit} onCancel={handleCloseModal} onClose={handleCloseModal}>
            <h1>{mode === 'create' ? 'Create a New Group' : 'Join an Existing Group'}</h1>
            {mode === 'create' ? (
              <>
                <Input
                  label="Group Name"
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
                <Input
                  label="Group Description"
                  placeholder="Enter description"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                />
              </>
            ) : (
              <Input
                label="Group Code"
                placeholder="Enter join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            )}
          </Modal>
        )}

        <div className="groups-list">
          {groups.length === 0 ? (
            <p style={{ color: 'var(--GRAY)' }}>No groups created yet.</p>
          ) : (
            groups.map((group, index) => (
              <div
                key={index}
                className="group-card"
                onClick={() => toggleGroupDetails(index)}
              >
                <div className="group-header">
                  <h3>{group.name}</h3>
                  <span className="group-code">Code: {group.code}</span>
                </div>

                {expandedGroupIndex === index && (
                  <div className="group-details">
                    <p><strong>Description:</strong> {group.description}</p>
                    <p><strong>Members:</strong></p>
                    <ul>
                      {group.members.map((member, i) => (
                        <li key={i}>{member}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Groups;
