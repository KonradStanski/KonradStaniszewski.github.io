import TranscriptChart from "./TranscriptChart";
import ClassChart from "./ClassChart";
import { TranscriptInfoType } from "@/lib/gpaCalculator/types";
import { useState } from "react";
import SemesterInfo from "./SemesterInfo";
import ClassInfo from "./ClassInfo";

type Props = {
  theme: string;
  transcriptInfo: TranscriptInfoType;
  setResultsHidden: React.Dispatch<React.SetStateAction<boolean>>;
};

const Results = (props: Props): JSX.Element => {
  const [semesterInfo, setSemesterInfo] = useState("");
  const [classInfo, setClassInfo] = useState("");

  function getSemesterComponent() {
    const semesterLabels = props.transcriptInfo.semesters.map(
      (semester) => semester.name
    );
    if (semesterLabels.includes(semesterInfo)) {
      const index = semesterLabels.indexOf(semesterInfo);
      return (
        <SemesterInfo
          setSemesterInfo={setSemesterInfo}
          semester={props.transcriptInfo.semesters[index]}
        />
      );
    }
  }

  function getClassComponent() {
    const classTypeLabels = props.transcriptInfo.classStatistics.map(
      (classStat) => classStat.name
    );
    if (classTypeLabels.includes(classInfo)) {
      const index = classTypeLabels.indexOf(classInfo);
      return (
        <ClassInfo
          setClassInfo={setClassInfo}
          classStatistic={props.transcriptInfo.classStatistics[index]}
        />
      );
    }
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold mb-4">
        Your final GPA is: {props.transcriptInfo.overallGpa.toFixed(4)}
      </h2>
      <TranscriptChart
        semesterInfo={semesterInfo}
        setSemesterInfo={setSemesterInfo}
        transcriptInfo={props.transcriptInfo}
        theme={props.theme}
      />
      {semesterInfo && getSemesterComponent()}
      <ClassChart
        classInfo={classInfo}
        setClassInfo={setClassInfo}
        transcriptInfo={props.transcriptInfo}
        theme={props.theme}
      />
      {classInfo && getClassComponent()}
      <button
        className="border-2 rounded-md border-gray-300 dark:border-gray-600 p-2 m-auto mt-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        onClick={() => {
          window.scrollTo(0, 100);
          props.setResultsHidden(true);
        }}
      >
        Calculate new GPA
      </button>
    </div>
  );
};

export default Results;
