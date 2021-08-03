import { ClassStatisticType } from "../../types/gpaCalculatorTypes";
import CloseIcon from "@material-ui/icons/Close";

type props = {
    classStatistic: ClassStatisticType;
    setClassInfo: React.Dispatch<React.SetStateAction<string>>;
};

const ClassInfo = (props: props): JSX.Element => {
    const classStat = props.classStatistic;
    const tableCols = ["Course", "Number", "Description", "Grade", "Units"];
    return (
        <div className="grid justify-items-stretch pb-1">
            <div className="border-2 py-1 rounded-md border-black bg-gray-200 dark:bg-gray-800 dark:border-gray-400">
                <div className="grid grid-flow-col">
                    <div> </div>
                    <h1 className="text-center justify-self-stretch">{classStat.name}</h1>
                    <div className="justify-self-end hover:cursor-pointer" onClick={() => props.setClassInfo("")}>
                        <CloseIcon className="mr-2" />
                    </div>
                </div>
                <div className="flex flex-row m-4">
                    <table className="mr-4 table-auto">
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
                            {classStat.classes.map((classObj) => {
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
                        <p>{`${classStat.name} had an average gpa of: ${classStat.gpa.toFixed(2)}`}</p>
                        <p>{`${classStat.name} had ${classStat.unitsTaken.toFixed(2)} units taken in total`}</p>
                        <p>{`${classStat.name} had ${classStat.gradePoints.toFixed(2)} grade points in total`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClassInfo;
