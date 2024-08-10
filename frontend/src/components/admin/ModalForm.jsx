import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Make sure to set the root element for accessibility

const ModalForm = ({ isOpen, onRequestClose, contentLabel, onSubmit, children, editingEvent }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={contentLabel}
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
    >
      <div className="bg-white p-8 rounded shadow-md max-w-md mx-auto mt-20">
        <h3 className="text-xl font-bold mb-4">{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex justify-end mt-4">
            <button type="button" onClick={onRequestClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2">
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {editingEvent ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ModalForm;
