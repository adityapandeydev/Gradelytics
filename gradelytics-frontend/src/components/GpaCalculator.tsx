import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Paper,
  Button,
  Typography,
  IconButton,
  Fade,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Course {
  id: number;
  credits: string;
  grade: string;
  hasLab: string;
  labGrade: string;
}

const GpaCalculator: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, credits: 'Select', grade: 'Select', hasLab: 'No', labGrade: 'Select' }
  ]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [labMode, setLabMode] = useState(false);

  const creditOptions = ['Select', '4', '3', '2', '1'];
  const gradeOptions = ['Select', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];
  const labOptions = ['No', 'Yes'];

  const addCourse = () => {
    if (courses.length < 10) {
      setCourses([...courses, {
        id: courses.length + 1,
        credits: 'Select',
        grade: 'Select',
        hasLab: 'No',
        labGrade: 'Select'
      }]);
    }
  };

  const removeCourse = (id: number) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
    }
  };

  const handleChange = (id: number, field: keyof Course, value: string) => {
    setCourses(courses.map(course => {
      if (course.id === id) {
        // Validate lab selection for 1-credit courses
        if (field === 'hasLab' && value === 'Yes' && course.credits === '1') {
          alert('A course with 1 credit cannot have a lab');
          return { ...course, hasLab: 'No' };
        }
        return { ...course, [field]: value };
      }
      return course;
    }));
  };

  const calculateGradePoints = (grade: string): number => {
    const gradePoints: { [key: string]: number } = {
      'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0
    };
    return gradePoints[grade] || 0;
  };

  const calculateGPA = () => {
    let totalGradePoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      if (course.credits !== 'Select' && course.grade !== 'Select') {
        const credits = parseInt(course.credits);
        
        if (labMode && course.hasLab === 'Yes' && course.labGrade !== 'Select') {
          const theoryCredits = credits - 1;
          const labCredits = 1;
          const theoryGradePoints = calculateGradePoints(course.grade) * theoryCredits;
          const labGradePoints = calculateGradePoints(course.labGrade) * labCredits;
          totalGradePoints += theoryGradePoints + labGradePoints;
          totalCredits += credits;
        } else {
          totalGradePoints += calculateGradePoints(course.grade) * credits;
          totalCredits += credits;
        }
      }
    });

    if (totalCredits > 0) {
      setGpa(Number((totalGradePoints / totalCredits).toFixed(2)));
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: 1200, 
      margin: '0 auto',
      height: { 
        xs: 'calc(100vh - 64px)',
        md: 'calc(100vh - 80px)' 
      },
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden', 
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          GPA Calculator
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={labMode}
              onChange={(e) => setLabMode(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#2196F3',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#2196F3',
                },
              }}
            />
          }
          label="Labs Graded Separately"
        />
      </Box>

      <Paper elevation={0} sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        mb: 1,
      }}>
        <TableContainer sx={{ 
          flex: 1,
          '& .MuiTable-root': {
            '& .MuiTableCell-root': {
              py: { xs: 1, sm: 1.5 },
            }
          }
        }}>
          <Table 
            stickyHeader 
            sx={{
              '& .MuiTableCell-root': {
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
                '&:first-of-type': {
                  pl: { xs: 2, sm: 3 }
                },
                '&:last-of-type': {
                  pr: { xs: 2, sm: 3 }
                }
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Grade</TableCell>
                {labMode && (
                  <>
                    <TableCell>Has Lab</TableCell>
                    <TableCell>Lab Grade</TableCell>
                  </>
                )}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>Course {course.id}</TableCell>
                  <TableCell>
                    <Select
                      value={course.credits}
                      onChange={(e) => handleChange(course.id, 'credits', e.target.value)}
                      size="small"
                      sx={{ minWidth: 100 }}
                    >
                      {creditOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={course.grade}
                      onChange={(e) => handleChange(course.id, 'grade', e.target.value)}
                      size="small"
                      sx={{ minWidth: 100 }}
                    >
                      {gradeOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  {labMode && (
                    <>
                      <TableCell>
                        <Select
                          value={course.hasLab}
                          onChange={(e) => handleChange(course.id, 'hasLab', e.target.value)}
                          size="small"
                          sx={{ minWidth: 100 }}
                        >
                          {labOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={course.labGrade}
                          onChange={(e) => handleChange(course.id, 'labGrade', e.target.value)}
                          size="small"
                          disabled={course.hasLab === 'No'}
                          sx={{ minWidth: 100 }}
                        >
                          {gradeOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => removeCourse(course.id)}
                      disabled={courses.length === 1}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Box sx={{ 
        mt: 2,
        display: 'flex', 
        gap: 2, 
        justifyContent: 'center',
        mb: 1,
      }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addCourse}
          disabled={courses.length >= 10}
          sx={{ borderRadius: 2 }}
        >
          Add Course
        </Button>
        <Button
          variant="contained"
          onClick={calculateGPA}
          sx={{ 
            borderRadius: 2,
            px: 4,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          }}
        >
          Calculate GPA
        </Button>
      </Box>

      <Fade in={gpa !== null}>
        <Box sx={{ 
          mt: 2,
          textAlign: 'center',
          p: 2,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Your GPA is: <span style={{ color: '#2196F3' }}>{gpa}</span>
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default GpaCalculator; 