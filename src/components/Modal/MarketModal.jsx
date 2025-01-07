import React from 'react';
import Modal from './Modal'; // <-- your custom modal

const MarketModal = ({
  isOpen,
  onClose,
  onSubmit,
  marketForm,
  onChange,
  loading,
  error,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Create a New Market</h2>
      {error && (
        <p style={{ color: 'red' }}>
          Error: {error.message}
        </p>
      )}

      <form onSubmit={onSubmit}>
        {/* Market name */}
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={marketForm.name}
              onChange={onChange}
              required
            />
          </label>
        </div>

        {/* Market Type (enum) */}
        <div>
          <label>
            Type (mType):
            <select
              name="mType"
              value={marketForm.mType}
              onChange={onChange}
            >
              <option value="ENERGY">ENERGY</option>
              <option value="RESERVE">RESERVE</option>
              {/* Add other valid enum values if needed */}
            </select>
          </label>
        </div>

        {/* Node */}
        <div>
          <label>
            Node:
            <input
              type="text"
              name="node"
              value={marketForm.node}
              onChange={onChange}
            />
          </label>
        </div>

        {/* Process Group */}
        <div>
          <label>
            Process Group:
            <input
              type="text"
              name="processGroup"
              value={marketForm.processGroup}
              onChange={onChange}
            />
          </label>
        </div>

        {/* direction (enum) */}
        <div>
          <label>
            Direction:
            <select
              name="direction"
              value={marketForm.direction}
              onChange={onChange}
            >
              <option value="UP">UP</option>
              <option value="DOWN">DOWN</option>
              <option value="UP_DOWN">UP_DOWN</option>
            </select>
          </label>
        </div>

        {/* realisation */}
        <div>
          <label>
            Realisation:
            <input
              type="number"
              step="0.01"
              name="realisation"
              value={marketForm.realisation}
              onChange={onChange}
            />
          </label>
        </div>

        {/* reserveType (string) */}
        <div>
          <label>
            Reserve Type:
            <input
              type="text"
              name="reserveType"
              value={marketForm.reserveType}
              onChange={onChange}
            />
          </label>
        </div>

        {/* isBid, isLimited (booleans) */}
        <div>
          <label>
            isBid:
            <input
              type="checkbox"
              name="isBid"
              checked={marketForm.isBid}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            isLimited:
            <input
              type="checkbox"
              name="isLimited"
              checked={marketForm.isLimited}
              onChange={onChange}
            />
          </label>
        </div>

        {/* minBid, maxBid, fee, price, upPrice, downPrice, reserveActivationPrice */}
        <div>
          <label>
            Min Bid:
            <input
              type="number"
              step="0.01"
              name="minBid"
              value={marketForm.minBid}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            Max Bid:
            <input
              type="number"
              step="0.01"
              name="maxBid"
              value={marketForm.maxBid}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            Fee:
            <input
              type="number"
              step="0.01"
              name="fee"
              value={marketForm.fee}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            Price:
            <input
              type="number"
              step="0.01"
              name="price"
              value={marketForm.price}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            upPrice:
            <input
              type="number"
              step="0.01"
              name="upPrice"
              value={marketForm.upPrice}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            downPrice:
            <input
              type="number"
              step="0.01"
              name="downPrice"
              value={marketForm.downPrice}
              onChange={onChange}
            />
          </label>
        </div>

        <div>
          <label>
            reserveActivationPrice:
            <input
              type="number"
              step="0.01"
              name="reserveActivationPrice"
              value={marketForm.reserveActivationPrice}
              onChange={onChange}
            />
          </label>
        </div>

        {/* Form buttons */}
        <div style={{ marginTop: '20px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Market'}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MarketModal;
