import React, { Fragment, useState, useEffect, useRef } from 'react';
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
  Column,
  HeaderGroup,
  CellProps,
  TableInstance,
  UsePaginationInstanceProps,
  UsePaginationState,
  UseGlobalFiltersInstanceProps,
  UseGlobalFiltersState,
} from 'react-table';
import SpkButton from '../reusable-uielements/spk-button';

// Componente GlobalFilter definido localmente
interface GlobalFilterProps {
  filter: string;
  setFilter: (filterValue: string) => void;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter }) => {
  return (
    <span className="ms-auto">
      <input
        value={filter || ''}
        onChange={(e) => setFilter(e.target.value)}
        className="form-control"
        placeholder="Search..."
      />
    </span>
  );
};

interface EditableCellProps {
  value: any;
  rowIndex: number;
  columnId: string;
  updateMyData: (rowIndex: number, columnId: string, value: any) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value: initialValue,
  rowIndex,
  columnId,
  updateMyData,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value);
  const onBlur = () => {
    setIsEditing(false);
    updateMyData(rowIndex, columnId, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return isEditing ? (
    <input value={value} onChange={onChange} onBlur={onBlur} autoFocus />
  ) : (
    <div onClick={() => setIsEditing(true)}>{value}</div>
  );
};

interface SpkdatatableProps<T extends object> {
  COLUMNS: Column<T>[];
  DATATABLE: T[];
  editable?: boolean;
  resetData?: () => void;
}

const Spkdatatable = <T extends object>({
  COLUMNS,
  DATATABLE,
  editable = false,
  resetData,
}: SpkdatatableProps<T>) => {
  const [data, setData] = useState(DATATABLE);
  const originalDataRef = useRef(DATATABLE);

  const updateMyData = (rowIndex: number, columnId: string, value: any) => {
    setData((oldData) =>
      oldData.map((row, index) => (index === rowIndex ? { ...row, [columnId]: value } : row))
    );
  };

  const editableCellRenderer = ({
    value,
    row,
    column,
  }: CellProps<T>): React.ReactNode => (
    <EditableCell
      value={value}
      rowIndex={row.index}
      columnId={column.id as string}
      updateMyData={updateMyData}
    />
  );

  const defaultColumn = editable ? { Cell: editableCellRenderer } : {};

  const tableInstance = useTable<T>(
    {
      columns: COLUMNS,
      data,
      defaultColumn,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  ) as TableInstance<T> &
    UsePaginationInstanceProps<T> &
    UseGlobalFiltersInstanceProps<T> & {
      state: UsePaginationState<T> & UseGlobalFiltersState<T>;
    };

  const {
    getTableProps,
    headerGroups,
    getTableBodyProps,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
    setGlobalFilter,
  } = tableInstance;

  const handleResetData = () => {
    setData(originalDataRef.current);
  };

  return (
    <Fragment>
      {editable && (
        <SpkButton onClickfunc={handleResetData} Buttonvariant="primary">
          Reset Data
        </SpkButton>
      )}

      <div className="d-flex align-items-center mb-3">
        <select
          className="my-1 selectpage border me-1 p-1 rounded-1"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>
              Show {size}
            </option>
          ))}
        </select>
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
      </div>

      <div className="table-responsive">
        <table {...getTableProps()} className="table table-hover mb-0 table-bordered">
          <thead>
            {headerGroups.map((headerGroup: HeaderGroup<T>) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={Math.random()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(
                      (column as any).getSortByToggleProps ? (column as any).getSortByToggleProps() : {}
                    )}
                    key={column.id}
                  >
                    {column.render('Header')}
                    <span>
                      {(column as any).isSorted
                        ? (column as any).isSortedDesc
                          ? <i className="fa fa-angle-down"></i>
                          : <i className="fa fa-angle-up"></i>
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="text-center">
                  No results found for &ldquo;{globalFilter}&rdquo;
                </td>
              </tr>
            ) : (
              page.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={Math.random()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} key={Math.random()}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between mt-4 ">
        <span className="">
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span className="sm:ms-auto ">
          <button
            className="btn-outline-light tablebutton me-2 sm:inline block my-1"
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            {' Previous '}
          </button>
          <button
            className="btn-outline-light tablebutton me-2 my-1"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            {' << '}
          </button>
          <button
            className="btn-outline-light tablebutton me-2 my-1"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            {' < '}
          </button>
          <button
            className="btn-outline-light tablebutton me-2 my-1"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            {' > '}
          </button>
          <button
            className="btn-outline-light tablebutton me-2 my-1"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            {' >> '}
          </button>
          <button
            className="btn-outline-light tablebutton me-2 sm:inline block my-1"
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {' Next '}
          </button>
        </span>
      </div>
    </Fragment>
  );
};

export default Spkdatatable;