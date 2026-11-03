import type { Field, Value } from '../../types';
export function DynamicField({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: Value | undefined;
  onChange: (value: Value) => void;
}) {
  const id = `field-${field.id}`,
    label = (
      <span>
        {field.label} <small>{field.id}</small>
      </span>
    );
  if (field.type === 'multi') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset className="field multi-field">
        <legend>{label}</legend>
        <div className="checkbox-options">
          {field.options?.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...selected, option]
                      : selected.filter((x) => x !== option),
                  )
                }
                disabled={
                  !selected.includes(option) &&
                  selected.length >= (field.max ?? 30)
                }
              />
              {option}
            </label>
          ))}
        </div>
        {field.id === 'F1' && selected.length > 0 && (
          <small className="muted">ลำดับ: {selected.join(' → ')}</small>
        )}
      </fieldset>
    );
  }
  return (
    <label
      className={`field ${field.type === 'textarea' ? 'wide' : ''}`}
      htmlFor={id}
    >
      {label}
      {field.type === 'select' ? (
        <select
          id={id}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">ยังไม่ทราบ / ไม่ได้รับข้อมูล</option>
          {field.options?.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          id={id}
          rows={3}
          maxLength={2000}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
      ) : (
        <input
          id={id}
          type={field.type}
          min={
            field.id === 'trlNumeric'
              ? 1
              : field.type === 'number'
                ? 0
                : undefined
          }
          max={field.max}
          step={
            ['unitCost', 'salePrice', 'studentShares', 'thaiShares'].includes(
              field.id,
            )
              ? '0.01'
              : field.type === 'number'
                ? 1
                : undefined
          }
          value={
            typeof value === 'number' || typeof value === 'string' ? value : ''
          }
          onChange={(e) =>
            onChange(
              e.target.value === ''
                ? null
                : field.type === 'number'
                  ? Number(e.target.value)
                  : e.target.value,
            )
          }
          maxLength={field.type === 'text' ? 2000 : undefined}
        />
      )}
      {field.help && <small className="muted">{field.help}</small>}
    </label>
  );
}
