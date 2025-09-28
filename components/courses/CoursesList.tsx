import { Course } from '../../types/course';

interface CoursesListProps {
  courses: Course[];
  courseFilter: string;
  viewMode: 'cards' | 'list';
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  setSelectedCourseId: (id: string | null) => void;
  setCurrentStep: (step: string) => void;
  setShowCreateCourse: (show: boolean) => void;
  setSelectedCourseForView: (id: string | null) => void;
  setShowCourseDetails: (show: boolean) => void;
}

const CoursesList: React.FC<CoursesListProps> = ({
  courses,
  courseFilter,
  viewMode,
  setCourses,
  setSelectedCourseId,
  setCurrentStep,
  setShowCreateCourse,
  setSelectedCourseForView,
  setShowCourseDetails,
}) => {
  const filteredCourses = courses.filter(course =>
    (courseFilter === 'all' || course.status === courseFilter) &&
    (course.title.toLowerCase())
  );

  return (
    <div className="courses-container">
      {viewMode === 'cards' ? (
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card-wrapper">
              <div className="course-card-background"></div>
              <div className="course-card">
                <div className="course-card-content">
                  <div className="course-image">
                    {course.coverImage ? (
                      <img 
                        src={URL.createObjectURL(course.coverImage)} 
                        alt={course.title} 
                        className="course-image"
                      />
                    ) : (
                      <div className="course-image-placeholder">
                        <span>📚</span>
                      </div>
                    )}
                  </div>
                  <div className="course-body">
                    <div className="course-header">
                      <h3 className="course-title">{course.title}</h3>
                      <div className="course-status-badge">
                        <span className="status-text">
                          {course.status === 'draft' ? 'مسودة' : 'منشور'}
                        </span>
                      </div>
                    </div>
                    <div className="course-content">
                      <p className="course-description">{course.description}</p>
                      <div className="course-meta">
                        <div className="course-price">
                          <span className="price-text">
                            {course.isFree ? 'مجاني' : `${course.price} جنيه`}
                          </span>
                        </div>
                        <div className="course-chapters">
                          <span className="chapters-text">{course.chapters.length} فصل</span>
                        </div>
                      </div>
                      <div className="course-date">
                        <span className="date-text">
                          {course.createdAt.toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                    <div className="course-actions">
                      <button
                        onClick={() => {
                          setSelectedCourseId(course.id);
                          setCurrentStep('content-management');
                          setShowCreateCourse(true);
                        }}
                        className="course-edit-button"
                      >
                        تحرير المحتوى
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourseForView(course.id);
                          setShowCourseDetails(true);
                        }}
                        className="course-content-button"
                      >
                        عرض
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="courses-list-view">
          {filteredCourses.map((course, index) => (
            <div key={course.id} className="course-list-item">
              <div className="course-list-number">
                <span className="list-number">{index + 1}</span>
              </div>
              <div className="course-list-image">
                {course.coverImage ? (
                  <img src={URL.createObjectURL(course.coverImage)} alt={course.title} className="list-course-image" />
                ) : (
                  <div className="list-course-placeholder">📚</div>
                )}
              </div>
              <div className="course-list-content">
                <div className="course-list-header">
                  <h3 className="course-list-title">{course.title}</h3>
                  <div className="course-list-status">
                    <span className={`status-badge ${course.status}`}>
                      {course.status === 'draft' ? 'مسودة' : 'منشور'}
                    </span>
                  </div>
                </div>
                <p className="course-list-description">{course.description}</p>
                <div className="course-list-actions">
                  <button
                    onClick={() => {
                      setSelectedCourseForView(course.id);
                      setShowCourseDetails(true);
                    }}
                    className="course-action-button view-course-button"
                  >
                     عرض
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setCurrentStep('content-management');
                      setShowCreateCourse(true);
                    }}
                    className="course-action-button edit-course-button"
                  >
                     تعديل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesList;