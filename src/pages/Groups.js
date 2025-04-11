import React, { useState, useEffect } from 'react';
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Confirmation from "../components/Confirmation"; // ⬅️ keep as-is
import './Groups.css';

const Groups = () => {
  const username = localStorage.getItem('username');
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [groups, setGroups] = useState([]);
  const [expandedGroupIndex, setExpandedGroupIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // ✅ Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationLabel, setConfirmationLabel] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState(() => () => {});

  const triggerConfirmation = (label, onConfirm) => {
    setConfirmationLabel(label);
    setOnConfirmCallback(() => () => {
      onConfirm();
      setShowConfirmation(false);
    });
    setShowConfirmation(true);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(`http://localhost:3500/groups/user/${username}`);
        const data = await res.json();
        if (res.ok) setGroups(data);
        else setErrorMessage(data.error || 'Failed to load groups.');
      } catch (err) {
        console.error('Error fetching groups:', err);
        setErrorMessage('Error loading groups.');
      }
    };
    fetchGroups();
  }, [username]);

  const handleOpenModal = (type) => {
    setMode(type);
    setModalOpen(true);
    setGroupName('');
    setGroupDesc('');
    setJoinCode('');
    setErrorMessage('');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setErrorMessage('');
  };

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
        code,
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
          const newGroup = { ...groupPayload, id: data.groupId, members: [username] };
          setGroups((prev) => [...prev, newGroup]);
          setErrorMessage('');
          handleCloseModal();
        } else {
          setErrorMessage(data.error || 'Failed to create group.');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Something went wrong while creating the group.');
      }
    } else if (mode === 'join') {
      try {
        const res = await fetch('http://localhost:3500/groups/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: joinCode, username }),
        });

        const data = await res.json();
        if (res.ok) {
          const updatedGroups = await fetch(`http://localhost:3500/groups/user/${username}`);
          const updatedData = await updatedGroups.json();
          setGroups(updatedData);
          setErrorMessage('');
          handleCloseModal();
        } else {
          setErrorMessage(data.error || 'Failed to join group.');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Something went wrong while joining the group.');
      }
    }
  };

  const disbandGroup = async (group) => {
    try {
      const res = await fetch(`http://localhost:3500/groups/${group.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setGroups((prev) => prev.filter(g => g.id !== group.id));
        setErrorMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to disband group.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error disbanding group.');
    }
  };

  const leaveGroup = async (group) => {
    try {
      const res = await fetch(`http://localhost:3500/groups/${group.id}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroups((prev) => prev.filter(g => g.id !== group.id));
        setErrorMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to leave group.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error leaving group.');
    }
  };

  const kickMember = async (group, member) => {
    try {
      const res = await fetch(`http://localhost:3500/groups/${group.id}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUsername: member }),
      });
      const data = await res.json();
      if (res.ok) {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? { ...g, members: g.members.filter((m) => m !== member) }
              : g
          )
        );
        setErrorMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to kick member.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error kicking member.');
    }
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

            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </Modal>
        )}

        <div className="groups-list">
          {groups.length === 0 ? (
            <p style={{ color: 'var(--GRAY)' }}>No groups created or joined yet.</p>
          ) : (
            groups.map((group, index) => (
              <div
                key={group.id || index}
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
                    <ul className="group-members-list">
                      {group.members?.map((member, i) => (
                        <li key={i} className="group-member-row">
                          <span className="group-member-name">{member}</span>
                          {username === group.createdBy && member !== username && (
                            <button
                              className="kick-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                kickMember(group, member);
                              }}
                            >
                              Kick
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div style={{ marginTop: '1rem' }}>
                      {username === group.createdBy ? (
                        <Button
                          label="Disband Group"
                          variant="red"
                          onClick={() =>
                            triggerConfirmation(`disband "${group.name}"`, () => disbandGroup(group))
                          }
                        />
                      ) : (
                        <Button
                          label="Leave Group"
                          variant="red"
                          onClick={() =>
                            triggerConfirmation(`leave "${group.name}"`, () => leaveGroup(group))
                          }
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

       
        {showConfirmation && (
          <Confirmation
            label={confirmationLabel}
            onConfirm={onConfirmCallback}
            onCancel={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </>
  );
};

export default Groups;
