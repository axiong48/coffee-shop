import { useState, useMemo } from "react";

export default function CustomizeModal({ menuItem, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  // group_name -> selected CustomizationOption
  const [selections, setSelections] = useState({});

  const groups = useMemo(() => {
    const map = {};
    for (const opt of menuItem.customizations) {
      if (!map[opt.group_name]) map[opt.group_name] = [];
      map[opt.group_name].push(opt);
    }
    return map;
  }, [menuItem]);

  const selectOption = (groupName, option) => {
    setSelections((prev) => ({ ...prev, [groupName]: option }));
  };

  const selectedOptions = Object.values(selections);
  const unitPrice = menuItem.base_price + selectedOptions.reduce((s, o) => s + o.price_delta, 0);

  const handleAdd = () => {
    onAdd(menuItem, quantity, selectedOptions);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{menuItem.name}</h3>
        <p className="muted" style={{ marginBottom: 16 }}>{menuItem.description}</p>

        {Object.entries(groups).map(([groupName, options]) => (
          <div className="option-group" key={groupName}>
            <div className="group-label">{groupName}</div>
            {options.map((opt) => (
              <div
                key={opt.id}
                className={`option-choice ${selections[groupName]?.id === opt.id ? "selected" : ""}`}
                onClick={() => selectOption(groupName, opt)}
              >
                <input
                  type="radio"
                  checked={selections[groupName]?.id === opt.id}
                  onChange={() => selectOption(groupName, opt)}
                />
                <span style={{ flex: 1 }}>{opt.choice_label}</span>
                {opt.price_delta > 0 && <span className="muted">+${opt.price_delta.toFixed(2)}</span>}
              </div>
            ))}
          </div>
        ))}

        <div className="field" style={{ marginTop: 16 }}>
          <label>Quantity</label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button type="button" className="btn-secondary" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span style={{ minWidth: 24, textAlign: "center" }}>{quantity}</span>
            <button type="button" className="btn-secondary" onClick={() => setQuantity((q) => q + 1)}>
              +
            </button>
          </div>
        </div>

        <div className="flex-between" style={{ marginTop: 20 }}>
          <span className="price-tag">${(unitPrice * quantity).toFixed(2)}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Add to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
