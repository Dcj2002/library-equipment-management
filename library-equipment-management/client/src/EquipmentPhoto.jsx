import React, { useEffect, useState } from 'react';
import computer from './assets/equipment/computer.jpeg';
import headphones from './assets/equipment/headphones.jpeg';
import printer from './assets/equipment/printer.jpeg';
import projector from './assets/equipment/projector.jpeg';
import scanner from './assets/equipment/scanner.jpeg';
import './equipment-photos.css';

export const equipmentPhotos = [
  { key: 'computer', label: 'Computer', src: computer },
  { key: 'headphones', label: 'Headphones', src: headphones },
  { key: 'printer', label: 'Printer', src: printer },
  { key: 'projector', label: 'Projector', src: projector },
  { key: 'scanner', label: 'Scanner', src: scanner }
];
const categoryPhotos = { Computer: 'computer', Audio: 'headphones', Printer: 'printer', Projector: 'projector', Scanner: 'scanner' };
export function resolvePhoto(item = {}) {
  const key = item.photoKey || categoryPhotos[item.category];
  return equipmentPhotos.find(photo => photo.key === key) || null;
}
export function EquipmentPhoto({ item, size = 'thumbnail' }) {
  const photo = resolvePhoto(item);
  const category = item?.category || (photo?.key === 'headphones' ? 'Audio' : photo?.label) || 'Other';
  const caption = category === 'Audio' && photo?.key === 'headphones' ? 'Audio / Headphones' : category;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [photo?.src]);
  return <span className={'equipment-photo equipment-photo-' + size}>
    <span className="equipment-photo-visual">{photo && !failed ? <img src={photo.src} alt={photo.label + ' reference photo'} loading="lazy" onError={() => setFailed(true)} /> : <span className="equipment-photo-empty">{size === 'thumbnail' ? '—' : 'No photo selected'}</span>}</span>
    <span className="equipment-photo-category">{caption}</span>
  </span>;
}
export function EquipmentPhotoPicker({ form, onChange }) {
  return <div className="equipment-photo-picker"><label htmlFor="equipment-photo-choice">Equipment photo<select id="equipment-photo-choice" value={form.photoKey || ''} onChange={e => onChange({ ...form, photoKey: e.target.value })}>
    <option value="">Automatic by category</option>
    {equipmentPhotos.map(photo => <option key={photo.key} value={photo.key}>{photo.label}</option>)}
    <option value="none">No photo</option>
  </select></label><div className="equipment-photo-choice-preview"><EquipmentPhoto item={form} size="preview" /><p>Choose a reference photo for this asset. Automatic uses the category photo; choose No photo when none matches.</p></div></div>;
}
