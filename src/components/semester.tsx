import React, { useState } from 'react';
import { semesterType } from '@app/types/gpacalculator';

type props = {
    semester: semesterType;
};

const Semester = (props: props): JSX.Element => {
    const semester = props.semester;
    const [open, setOpen] = useState(false);
    const tableCols = ['Course', 'Number', 'Description', 'Grade'];

    return (
        <div className="grid justify-items-stretch pb-1" key={semester.name}>
            <button
                className="border-2 py-1 rounded-md border-black bg-gray-200 dark:bg-gray-800 dark:border-gray-400"
                onClick={() => setOpen(!open)}
            >
                {semester.name}
            </button>
            <div className={open ? '' : 'hidden'}>
                <table className="table-auto border-separate border border-green-800">
                    <thead>
                        <tr>
                            {tableCols.map((col) => {
                                return (
                                    <th
                                        key={col}
                                        className="border border-green-600"
                                    >
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
                                    <td className="border border-green-600">
                                        {classObj.course}
                                    </td>
                                    <td className="border border-green-600">
                                        {classObj.number}
                                    </td>
                                    <td className="border border-green-600">
                                        {classObj.desc}
                                    </td>
                                    <td className="border border-green-600 text-center">
                                        {classObj.remarkStr}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Semester;
