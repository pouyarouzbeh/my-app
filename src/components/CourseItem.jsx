// CourseItem.jsx
import React from 'react';

const CourseItem = ({ course, isSelected, hasPrerequisites, onToggle }) => {
  return (
    <li
      className={`list-group-item d-flex justify-content-between align-items-center ${!hasPrerequisites ? 'disabled' : ''}`}
    >
      <span>
        {course.name} ({course.credit} واحد)
        {!hasPrerequisites && (
          <span className="text-danger">
            {" "}
            - نیازمند پیش‌نیاز: {course.prerequisites.join(', ')}
          </span>
        )}
      </span>
      <button
        className={`btn btn-sm ${isSelected ? "btn-danger" : "btn-primary"}`}
        onClick={() => onToggle(course)}
        disabled={!hasPrerequisites}
      >
        {isSelected ? "حذف" : "انتخاب"}
      </button>
    </li>
  );
};

export default CourseItem;
