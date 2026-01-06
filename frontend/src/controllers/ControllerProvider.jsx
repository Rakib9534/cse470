/**
 * Controller Provider
 * Provides all controllers to the application via React Context
 */
import { createContext, useContext } from 'react';
import AuthController from './AuthController.js';
import AppointmentController from './AppointmentController.js';
import LabResultController from './LabResultController.js';
import TreatmentController from './TreatmentController.js';
import DoctorSlotController from './DoctorSlotController.js';
import EquipmentController from './EquipmentController.js';
import BillController from './BillController.js';

const ControllerContext = createContext();

export function ControllerProvider({ children }) {
  // Initialize all controllers
  const controllers = {
    auth: new AuthController(),
    appointment: new AppointmentController(),
    labResult: new LabResultController(),
    treatment: new TreatmentController(),
    doctorSlot: new DoctorSlotController(),
    equipment: new EquipmentController(),
    bill: new BillController()
  };

  return (
    <ControllerContext.Provider value={controllers}>
      {children}
    </ControllerContext.Provider>
  );
}

export function useControllers() {
  const context = useContext(ControllerContext);
  if (!context) {
    throw new Error('useControllers must be used within a ControllerProvider');
  }
  return context;
}

