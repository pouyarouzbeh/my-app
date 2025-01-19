// CategoryAccordion.jsx
import React from 'react';
import CourseItem from './CourseItem';

const CategoryAccordion = ({ category, selectedCourses, passedCourses, onToggle }) => {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={`heading-${category.id}`}>
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#collapse-${category.id}`}
          aria-expanded="false"
          aria-controls={`collapse-${category.id}`}
        >
          {category.name}
        </button>
      </h2>
      <div
        id={`collapse-${category.id}`}
        className="accordion-collapse collapse"
        aria-labelledby={`heading-${category.id}`}
        data-bs-parent="#courseAccordion"
      >
        <div className="accordion-body">
          {category.courses.length === 0 ? (
            <div className="alert alert-warning">
              هیچ درسی در این دسته‌بندی موجود نیست.
            </div>
          ) : (
            <ul className="list-group registration-list-group">
              {category.courses.map((course) => {
                const isSelected = selectedCourses.some((c) => c.id === course.id);
                const hasPrerequisites = course.prerequisites
                  ? course.prerequisites.every(prereq => passedCourses.includes(prereq))
                  : true;

                return (
                  <CourseItem
                    key={course.id}
                    course={course}
                    isSelected={isSelected}
                    hasPrerequisites={hasPrerequisites}
                    onToggle={onToggle}
                  />
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryAccordion;
