import TranscriptChart from "./charts/transcriptChart";
import ClassChart from "./charts/classChart";
import { TranscriptInfoType } from "../../types/gpaCalculatorTypes";
import { useState } from "react";
import SemesterInfo from "./semesterInfo";
import ClassInfo from "./classInfo";

const Results = (props: {
    theme: string;
    transcriptInfo: TranscriptInfoType;
    setResultsHidden: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
    const [semesterInfo, setSemesterInfo] = useState("");
    const [classInfo, setClassInfo] = useState("");

    function getSemesterComponent() {
        const semesterLabels = props.transcriptInfo.semesters.map((semester) => semester.name);
        if (semesterLabels.includes(semesterInfo)) {
            const index = semesterLabels.indexOf(semesterInfo);
            return <SemesterInfo setSemesterInfo={setSemesterInfo} semester={props.transcriptInfo.semesters[index]} />;
        }
    }

    function getClassComponent() {
        const classTypeLabels = props.transcriptInfo.classStatistics.map((classStat) => classStat.name);
        if (classTypeLabels.includes(classInfo)) {
            const index = classTypeLabels.indexOf(classInfo);
            return (
                <ClassInfo setClassInfo={setClassInfo} classStatistic={props.transcriptInfo.classStatistics[index]} />
            );
        }
    }

    return (
        <div className="flex flex-col">
            {/* Results Section */}
            <h1>{`Your final GPA is: ${props.transcriptInfo.overallGpa.toFixed(4)}`}</h1>
            <TranscriptChart
                semesterInfo={semesterInfo}
                setSemesterInfo={setSemesterInfo}
                transcriptInfo={props.transcriptInfo}
                theme={props.theme}
            />
            {semesterInfo && getSemesterComponent()}
            {/* Class Summary Statistics */}
            <ClassChart
                classInfo={classInfo}
                setClassInfo={setClassInfo}
                transcriptInfo={props.transcriptInfo}
                theme={props.theme}
            />
            {classInfo && getClassComponent()}
            <button
                className="border-2 rounded-md border-black p-1 m-auto mt-4 bg-gray-200 dark:bg-gray-800 dark:border-gray-400"
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
