export default (entities:any[]) => {
	
	if(!entities || entities.length === 0) return [];
  return entities.reduce((acc, entity) => {
    return [...acc, entity.id];
  }, []);
};