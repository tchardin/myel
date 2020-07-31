import createIconComponent from '../utils/createIconComponent';
const List = createIconComponent({
  content: [
    {
      type: 'path',
      d:
        'M12 10H10V11H12V10ZM12 20H10V21H12V20ZM10 15H12V16H10V15ZM22 10H14V11H22V10ZM14 20H22V21H14V20ZM22 15H14V16H22V15Z',
      fillRule: 'evenodd',
      clipRule: 'evenodd',
      colorable: true,
      fill: '#000',
    },
  ],
  width: 32,
  height: 32,
  viewBox: '0 0 32 32',
});
List.displayName = 'List';
export default List;
