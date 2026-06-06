/**
 * Validation utilities for MindBoard.
 * Provides input validation functions for mood, trigger, and student info data
 * to ensure data integrity before submission.
 *
 * @module utils/validation
 */

import { MOODS_LIST, TRIGGERS_LIST, EXAMS_LIST } from "../constants";

/**
 * Checks if the given mood is one of the 5 valid MOODS_LIST values.
 *
 * @param {string} mood - The mood value to validate.
 * @returns {boolean} True if mood is a valid MOODS_LIST value.
 */
export function isValidMood(mood) {
  if (!mood || typeof mood !== "string") return false;
  return MOODS_LIST.some((m) => m.value === mood);
}

/**
 * Checks if the given trigger is one of the 7 valid TRIGGERS_LIST values.
 *
 * @param {string} trigger - The trigger value to validate.
 * @returns {boolean} True if trigger is a valid TRIGGERS_LIST value.
 */
export function isValidTrigger(trigger) {
  if (!trigger || typeof trigger !== "string") return false;
  return TRIGGERS_LIST.includes(trigger);
}

/**
 * Checks if the given student info object is valid for onboarding submission.
 * Requires a non-empty name, a valid target exam from EXAMS_LIST,
 * and a valid exam date string (or null/undefined for optional).
 *
 * @param {object} info - The student info object to validate.
 * @param {string} info.name - The student's name.
 * @param {string} info.targetExam - The target exam value.
 * @param {string} [info.examDate] - The optional exam date string.
 * @returns {boolean} True if the student info is valid.
 */
export function isValidStudentInfo(info) {
  if (!info || typeof info !== "object") return false;
  if (!info.name || typeof info.name !== "string" || !info.name.trim()) return false;
  if (!info.targetExam || typeof info.targetExam !== "string") return false;
  if (!EXAMS_LIST.some((e) => e.value === info.targetExam)) return false;
  return true;
}
