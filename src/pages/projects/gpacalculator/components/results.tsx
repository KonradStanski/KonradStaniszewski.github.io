import TranscriptChart from "./transcriptChart";
import ClassChart from "./classChart";
import Semester from "./semester";
import { transcriptInfoType } from "../gpaCalculatorTypes";

const Results = (props: {
    theme: string;
    transcriptInfo: transcriptInfoType;
    setResultsHidden: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
    return (
        <div className="flex flex-col">
            {/* Results Section */}
            <h1>{`Your final GPA is: ${props.transcriptInfo.overallGpa.toFixed(4)}`}</h1>
            <TranscriptChart transcriptInfo={props.transcriptInfo} theme={props.theme} />
            {/* Class Summary Statistics */}
            <ClassChart transcriptInfo={props.transcriptInfo} theme={props.theme} />
            <div className="mb-6">
                {props.transcriptInfo.semesters.map((semester) => {
                    return <Semester key={semester.name} semester={semester} />;
                })}
            </div>
            <button
                className="border-2 rounded-md border-black p-1 m-auto bg-gray-200 dark:bg-gray-800 dark:border-gray-400"
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
