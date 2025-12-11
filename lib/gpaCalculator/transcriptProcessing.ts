import {
  TranscriptInfoType,
  SemesterType,
  ClassType,
  ClassStatisticType,
} from "./types";

// prettier-ignore
const remarks: Record<string, { value: number; include: boolean }> = {
  '': { value: 0, include: false },
  'A+': { value: 4, include: true },
  'A': { value: 4, include: true },
  'A-': { value: 3.7, include: true },
  'B+': { value: 3.3, include: true },
  'B': { value: 3, include: true },
  'B-': { value: 2.7, include: true },
  'C+': { value: 2.3, include: true },
  'C': { value: 2, include: true },
  'C-': { value: 1.7, include: true },
  'D+': { value: 1.3, include: true },
  'D': { value: 1, include: true },
  'F': { value: 0, include: true },
  'F4': { value: 0, include: true },
  'CR': { value: 0, include: false },
  'W': { value: 0, include: false },
};

const regex = {
  semesterLine: /(Fall|Winter|Summer|Spring) Term \d{4}/,
  classLineCopyPaste: /^[\w\s]{1,7}\s+\d{3}\w?\s{3}\w/,
  classLinePDF: /^[\w\s]{1,6}\d{3}\s{4,5}/,
};

export default function processTranscriptText(
  inString: string,
  textArea: HTMLTextAreaElement,
  pasted: boolean
): TranscriptInfoType | undefined {
  let semesters = getSemesters(inString, pasted);
  if (!semesters?.length) {
    textArea.setCustomValidity("Please enter a valid transcript or pdf file");
    return;
  }
  semesters.map((semester) => generateSemesterProperties(semester));
  semesters = getRunningSemesterProperties(semesters);
  const classStatistics = getClassStatistics(semesters);

  return {
    semesters: semesters,
    overallGpa: semesters[semesters.length - 1].cumulativeGpa,
    classStatistics: classStatistics,
  };
}

function getSemesters(inString: string, pasted: boolean): Array<SemesterType> {
  const lines = inString.split("\n");
  const semesters: Array<SemesterType> = [];
  let index = -1;
  for (const line of lines) {
    if (regex.semesterLine.test(line)) {
      index += 1;
      const semesterObj = createSemester(line);
      semesters.push(semesterObj);
    } else if (index !== -1) {
      semesters[index].lines.push(line);
      if (pasted && regex.classLineCopyPaste.test(line)) {
        const classObj = createClass(line, pasted);
        semesters[index].classes.push(classObj);
      } else if (!pasted && regex.classLinePDF.test(line)) {
        const classObj = createClass(line, pasted);
        semesters[index].classes.push(classObj);
      }
    }
  }
  return semesters;
}

function createSemester(semesterLine: string): SemesterType {
  const semester: SemesterType = {
    name: semesterLine.slice(0, 16).trim(),
    lines: [semesterLine],
    classes: [],
    valid: false,
    totalGradePoints: 0,
    totalUnitsTaken: 0,
    semGpa: 0,
    cumulativeGpa: 0,
    cumulativeGradePoints: 0,
    cumulativeUnitsTaken: 0,
  };
  return semester;
}

function createClass(classLine: string, pasted: boolean): ClassType {
  const remark = pasted
    ? classLine.slice(38, 41).trim()
    : classLine.slice(48, 51).trim();
  const classObj = pasted
    ? {
        line: classLine,
        course: classLine.slice(0, 6).trim(),
        number: parseInt(classLine.slice(6, 9)),
        desc: classLine.slice(12, 38),
        remarkStr: remark,
        remarkNum: remarks[remark]?.value,
        unitsTaken: parseFloat(classLine.slice(47, 50)),
        gradePoints: parseFloat(classLine.slice(61, 66)),
        include: remarks[remark].include,
      }
    : {
        line: classLine,
        course: classLine.slice(0, 6).trim(),
        number: parseInt(classLine.slice(6, 9)),
        desc: classLine.slice(14, 42),
        remarkStr: remark,
        remarkNum: remarks[remark]?.value,
        unitsTaken: parseFloat(classLine.slice(60, 63)),
        gradePoints: parseFloat(classLine.slice(79, 85)),
        include: remarks[remark].include,
      };
  return classObj;
}

function generateSemesterProperties(semester: SemesterType): SemesterType {
  semester.totalGradePoints = semester.classes.reduce<number>(
    (sum: number, curr: ClassType) =>
      sum + (curr.include ? curr.gradePoints : 0),
    0
  );
  semester.totalUnitsTaken = semester.classes.reduce<number>(
    (sum: number, curr: ClassType) =>
      sum + (curr.include ? curr.unitsTaken : 0),
    0
  );
  semester.valid = semester.classes.some((classObj) => {
    return classObj.include === true;
  });
  semester.semGpa = semester.valid
    ? semester.totalGradePoints / semester.totalUnitsTaken
    : 0.0;
  return semester;
}

function getRunningSemesterProperties(
  semesters: Array<SemesterType>
): Array<SemesterType> {
  semesters.map((semester, index) => {
    semester.cumulativeGradePoints = semesters
      .slice(0, index + 1)
      .reduce(
        (sum: number, curr: SemesterType) =>
          sum + (curr.valid ? curr.totalGradePoints : 0),
        0
      );
  });

  semesters.map((semester, index) => {
    semester.cumulativeUnitsTaken = semesters
      .slice(0, index + 1)
      .reduce(
        (sum: number, curr: SemesterType) =>
          sum + (curr.valid ? curr.totalUnitsTaken : 0),
        0
      );
  });

  semesters.map((semester) => {
    semester.cumulativeGpa =
      semester.cumulativeGradePoints / semester.cumulativeUnitsTaken;
  });

  return semesters;
}

function getClassStatistics(
  semesters: SemesterType[]
): ClassStatisticType[] {
  const classStatistics = new Map<string, ClassStatisticType>();
  semesters.forEach((semester: SemesterType) => {
    semester.classes.forEach((classObj: ClassType) => {
      if (classStatistics.has(classObj.course)) {
        const classStat = classStatistics.get(classObj.course);
        if (classStat) {
          if (classObj.include) {
            classStat.unitsTaken += classObj.unitsTaken;
            classStat.gradePoints += classObj.gradePoints;
          }
          classStat.classes.push(classObj);
          classStatistics.set(classObj.course, classStat);
        }
      } else {
        classStatistics.set(classObj.course, {
          name: classObj.course,
          unitsTaken: classObj.include ? classObj.unitsTaken : 0,
          gradePoints: classObj.include ? classObj.gradePoints : 0,
          gpa: 0,
          classes: [classObj],
        });
      }
    });
  });
  classStatistics.forEach(
    (classObj) => (classObj.gpa = classObj.gradePoints / classObj.unitsTaken)
  );
  return Array.from(classStatistics).map((arrVal) => arrVal[1]);
}
