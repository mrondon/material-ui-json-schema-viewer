import React, { Fragment } from 'react';
import { shape, string } from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NormalLeftRow from '../NormalLeftRow';
import NormalRightRow from '../NormalRightRow';

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: 'grid',
    gridTemplateColumns: '[left-panel] 1fr [right-panel] 1fr',
  },
  leftPanel: {
    backgroundColor: theme.palette.background.paper,
    borderRight: `${theme.spacing(1)}px solid ${theme.palette.grey[300]}`,
    overflowX: 'auto',
  },
  rightPanel: {
    backgroundColor: theme.palette.background.paper,
    overflowX: 'auto',
  },
  row: {
    borderBottom: `2px solid ${theme.palette.grey[300]}`,
  },
  lastRow: {
    borderBottom: 'none',
  },
  rightRow: {
    display: 'grid',
    gridTemplateColumns: '[keyword-column] 1fr [description-column] 1fr',
  },
  keywordColumn: {},
  descriptionColumn: {},
  line: {
    margin: 0,
    whiteSpace: 'nowrap',
  },
  code: {
    backgroundColor: theme.palette.grey[300],
  },
}));

function SchemaTable({ schema }) {
  const classes = useStyles();
  /**
   * Rows for the left and right column are stored separately
   * so that the left and right panels can render the rows separately.
   * This enable the viewer to have a two-column layout with each of
   * the columns having its own horizontal scroll.
   */
  const leftRows = [];
  const rightRows = [];
  /**
   * Create a single normal row (left and right column each).
   * The result is stored in an object format in order for the
   * pushRow() method to easily access each left and right column
   * of the single row and push them to leftRows and rightRows respectively.
   */
  const createNormalRow = schemaInput => ({
    leftRow: (
      <NormalLeftRow
        key={leftRows.length + 1}
        schema={schemaInput}
        classes={classes}
      />
    ),
    rightRow: (
      <NormalRightRow
        key={rightRows.length + 1}
        schema={schemaInput}
        classes={classes}
      />
    ),
  });
  // TODO: refactor closeRow into separate component
  /**
   * Create a row to close off an array or object type schema.
   * The left row displays a closing bracket of the type while
   * the right row only consists of blank line padding.
   */
  const createClosingRow = type => {
    const clostTypeSymbol = {
      array: ']',
      object: '}',
    }[type];

    return {
      leftRow: (
        <div key={`close ${type}`} className={classes.row}>
          <Typography component="div" className={classes.line}>
            {clostTypeSymbol}
          </Typography>
        </div>
      ),
      /** TODO: may have to restrucutre closeRightRow to include
       *        keywordColumn, descriptionColumn for overall consistency
       *        with <NormalRightRow />
       */
      rightRow: (
        <div
          key={`close ${type}`}
          className={`${classes.row} ${classes.rightRow}`}>
          <Typography component="div" className={classes.line}>
            <br />
          </Typography>
        </div>
      ),
    };
  };

  /**
   * Takes a single row as input, created from createNormalRow()
   * method, and pushes the left column and right column of the
   * row into the leftRows and rightRows respectively.
   */
  const pushRow = row => {
    leftRows.push(row.leftRow);
    rightRows.push(row.rightRow);
  };

  /**
   * Array type schemas start with an openArrayRow and are closed off
   * with a closeArrayRow, which both display brackets to indicate an array.
   * In between those two rows, array items are parsed and rendered 
   * according to their type via calling back on the renderSchema() method. 
   * The rows created are added sequentially below the openArrayRow.
   */
  function renderArray(schemaInput) {
    const openArrayRow = createNormalRow(schemaInput);
    const closeArrayRow = createClosingRow(schemaInput.type);

    pushRow(openArrayRow);

    if ('items' in schemaInput) {
      renderSchema(schemaInput.items);
    }

    pushRow(closeArrayRow);
  }

  /**
   * TODO: define renderCombination method
   *       add description comment
   */
  function renderCombination(schemaInput) {
    return <React.Fragment>{schemaInput}</React.Fragment>;
  }

  /**
   * Default data type schemas (boolean, null, number, integer, string)
   * are parsed to create 'NormalLeftRow' and 'NormalRightRow' components.
   * These will then be stored into 'leftRows' and 'rightRows' arrays each.
   */
  function renderDefault(schemaInput) {
    const normalRow = createNormalRow(schemaInput);

    pushRow(normalRow);
  }

  /**
   * TODO: define renderObject method
   *       add description comment
   */
  function renderObject(schemaInput) {
    return <React.Fragment>{schemaInput}</React.Fragment>;
  }

  /**
   * TODO: define renderRef method
   *       add description comment
   */
  function renderRef(schemaInput) {
    return <React.Fragment>{schemaInput}</React.Fragment>;
  }

  /**
   * Schemas are passed to different render methods according to its
   * specific type (combination, array, object, ref, and default).
   * Each method will create rows with the appropriate format to its
   * type and push the rows into 'leftRows' and 'rightRows' respectively.
   * The rows will then be rendered within the left and right panels.
   * Types other than default schemas may repeatedly call this method
   * within their render method if the schema has a nested structure.
   */
  function renderSchema(schemaInput) {
    if (
      'allOf' in schemaInput ||
      'anyOf' in schemaInput ||
      'oneOf' in schemaInput ||
      'not' in schemaInput
    ) {
      renderCombination(schemaInput);
    } else if ('$ref' in schemaInput) {
      renderRef(schemaInput);
    } else if (schemaInput.type === 'array') {
      renderArray(schemaInput);
    } else if (schemaInput.type === 'object') {
      renderObject(schemaInput);
    } else {
      renderDefault(schemaInput);
    }
    // TODO: handle empty json schemas

    return (
      <div className={classes.wrapper}>
        <div className={classes.leftPanel}>{leftRows}</div>
        <div className={classes.rightPanel}>{rightRows}</div>
      </div>
    );
  }

  return <Fragment>{renderSchema(schema)}</Fragment>;
}

SchemaTable.propTypes = {
  schema: shape({
    type: string,
  }),
};

SchemaTable.defaultProps = {
  schema: {
    type: 'null',
  },
};

export default React.memo(SchemaTable);
