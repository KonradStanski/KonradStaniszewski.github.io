import { SemesterType } from "../../types/gpaCalculatorTypes";
import CloseIcon from "@material-ui/icons/Close";

type props = {
    semester: SemesterType;
    setSemesterInfo: React.Dispatch<React.SetStateAction<string>>;
};

const SemesterInfo = (props: props): JSX.Element => {
    const semester = props.semester;
    const tableCols = ["Course", "Number", "Description", "Grade", "Units"];
    return (
        <div className="grid justify-items-stretch pb-1">
            <div className="border-2 py-1 rounded-md border-black bg-gray-200 dark:bg-gray-800 dark:border-gray-400">
                <div className="grid grid-flow-col">
                    <div> </div>
                    <h1 className="text-center justify-self-stretch">{semester.name}</h1>
                    <div className="justify-self-end hover:cursor-pointer" onClick={() => props.setSemesterInfo("")}>
                        <CloseIcon className="mr-2" />
                    </div>
                </div>
                <div className="flex flex-row m-4">
                    <table className="table-auto mr-4">
                        <thead>
                            <tr>
                                {tableCols.map((col) => {
                                    return (
                                        <th key={col} className="border border-black p-1">
                                            {col}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {semester.classes.map((classObj) => {
                                return (
                                    <tr key={classObj.course + classObj.number}>
                                        <td className="border border-black p-1">{classObj.course}</td>
                                        <td className="border border-black p-1">{classObj.number}</td>
                                        <td className="border border-black p-1">{classObj.desc}</td>
                                        <td className="border border-black p-1">{classObj.remarkStr}</td>
                                        <td className="border border-black p-1">{classObj.unitsTaken}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div>
                        <p>{`This semesters total units: ${semester.totalUnitsTaken.toFixed(2)}`}</p>
                        <p>{`This semesters total grade points: ${semester.totalGradePoints.toFixed(2)}`}</p>
                        <p>{`Your cumulative units taken: ${semester.cumulativeUnitsTaken.toFixed(2)}`}</p>
                        <p>{`Your cumulative grade points: ${semester.cumulativeGradePoints.toFixed(2)}`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SemesterInfo;
