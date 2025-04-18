import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../../../context/AuthContext';
import { updateTrainingPlan, TrainingPlan } from '../../../../services/trainingPlans';
import { fetchModules, type Module } from '../../../../services/modules';
import { fetchSimulations, type Simulation } from '../../../../services/simulations';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  IconButton,
  TextField,
  Box,
  Button,
  Avatar,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  ClickAwayListener,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Book as BookIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface Item {
  id: string;
  name: string;
  type: 'module' | 'simulation';
  simCount?: number;
}

interface EditTrainingPlanFormData {
  name: string;
  tags: string[];
  selectedItems: Item[];
}

interface EditTrainingPlanDialogProps {
  open: boolean;
  onClose: () => void;
  trainingPlan: TrainingPlan | null;
  onUpdateSuccess?: () => void;
}

const availableTags = ['Tag 01', 'Tag 02', 'Tag 03', 'Tag 04', 'Tag 05'];

const EditTrainingPlanDialog: React.FC<EditTrainingPlanDialogProps> = ({
  open,
  onClose,
  trainingPlan,
  onUpdateSuccess,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemsList, setShowItemsList] = useState(false);
  const searchFieldRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
    watch,
    setValue,
    reset,
  } = useForm<EditTrainingPlanFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      tags: [],
      selectedItems: [],
    },
  });

  // Initialize form with training plan data when it changes
  useEffect(() => {
    if (trainingPlan) {
      // Reset form with training plan data
      reset({
        name: trainingPlan.name,
        tags: trainingPlan.tags || [],
        selectedItems: [], // Will be populated after loading modules and simulations
      });

      // Load items to populate the selectedItems
      loadItems();
    }
  }, [trainingPlan, reset]);

  const loadItems = async () => {
    if (!user?.id || !trainingPlan) return;

    try {
      setIsLoading(true);
      setError(null);

      const [modulesData, simulationsData] = await Promise.all([
        fetchModules(user.id),
        fetchSimulations(user.id)
      ]);

      // Create a map of all available items
      const combinedItems: Item[] = [
        ...modulesData.map(m => ({ 
          id: m.id, 
          name: m.name, 
          type: 'module' as const, 
          simCount: m.simulations_id.length 
        })),
        ...simulationsData.map(s => ({ 
          id: s.id, 
          name: s.sim_name, 
          type: 'simulation' as const 
        }))
      ];

      setItems(combinedItems);

      // Find the items that are in the training plan's added_object array
      const selectedItems: Item[] = trainingPlan.added_object
        .map(obj => {
          const foundItem = combinedItems.find(
            item => item.id === obj.id && item.type === obj.type
          );
          return foundItem || null;
        })
        .filter((item): item is Item => item !== null);

      // Set the selected items in the form
      setValue('selectedItems', selectedItems);
    } catch (err) {
      setError('Failed to load items');
      console.error('Error loading items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedItems = watch('selectedItems');
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getModuleAndSimCount = () => {
    const modules = selectedItems.filter(item => item.type === 'module').length;
    const sims = selectedItems.filter(item => item.type === 'simulation').length;
    return { modules, sims };
  };

  const onSubmit = async (data: EditTrainingPlanFormData) => {
    if (!user?.id || !trainingPlan?.id) {
      setSubmitError('Missing required information');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setUpdateSuccess(false);

      const response = await updateTrainingPlan(
        trainingPlan.id,
        {
          user_id: user.id,
          training_plan_name: data.name,
          tags: data.tags,
          added_object: data.selectedItems.map(item => ({
            type: item.type,
            id: item.id
          }))
        }
      );

      // Check if response has an id, which indicates success
      if (response && response.id) {
        setUpdateSuccess(true);

        // Call the success callback to refresh the data in the parent component
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } else {
        setSubmitError('Failed to update training plan');
      }
    } catch (error) {
      console.error('Error updating training plan:', error);
      setSubmitError('Failed to update training plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeItem = (itemToRemove: Item) => {
    setValue(
      'selectedItems',
      selectedItems.filter(item => item.id !== itemToRemove.id),
      { shouldValidate: true }
    );
  };

  const isItemSelected = (item: Item): boolean => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  const handleItemToggle = (item: Item) => {
    const currentItems = selectedItems;
    const isCurrentlySelected = isItemSelected(item);

    let newItems: Item[] = [];
    if (isCurrentlySelected) {
      newItems = currentItems.filter(selected => selected.id !== item.id);
    } else {
      newItems = [...currentItems, item];
    }

    setValue('selectedItems', newItems, { shouldValidate: true });
  };

  const { modules, sims } = getModuleAndSimCount();

  if (!trainingPlan) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 600,
        },
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              position: 'relative',
              width: 48,
              height: 48,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: -6,
                left: -6,
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#EEF4FF',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#F5F6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <BookIcon sx={{ color: '#444CE7' }} />
            </Box>
          </Box>

          <Stack spacing={0.5} flex={1}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Edit Training Plan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update training plan details and content
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: '24px !important' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
              <Controller
                name="name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Training Plan Name"
                    required
                    fullWidth
                    size="medium" />
                )} />

            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  multiple
                  fullWidth
                  displayEmpty
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selected?.length === 0 ? (
                        <Typography color="text.secondary">Add Tags</Typography>
                      ) : (
                        selected.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            onDelete={() => {
                              const newTags = field.value.filter(t => t !== tag);
                              field.onChange(newTags);
                            }}
                            sx={{
                              borderRadius: 20,
                              backgroundColor: '#F5F6FF',
                              border: '1px solid #DEE2FC',
                              color: '#444CE7',
                            }}
                          />
                        ))
                      )}
                    </Box>
                  )}
                >
                  {availableTags.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />

            <Box>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">
                    Add Simulations and Modules
                  </Typography>
                  <Chip
                    label={`${modules} Modules | ${sims} Sims`}
                    sx={{
                      bgcolor: '#F5F6FF',
                      color: '#444CE7',
                      borderRadius: 16,
                      height: 28,
                    }}
                  />
                </Stack>

                <Box position="relative" ref={searchFieldRef}>
                  <ClickAwayListener onClickAway={() => setShowItemsList(false)}>
                    <Box>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Search simulations or modules..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowItemsList(true);
                        }}
                        onClick={() => setShowItemsList(true)}
                        InputProps={{
                          startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                        }}
                      />
                      {showItemsList && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            zIndex: 1300,
                            width: searchFieldRef.current?.offsetWidth || '100%',
                            left: 0,
                            mt: 0.5,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 3,
                            maxHeight: 300,
                            minHeight: filteredItems.length > 0 ? 250 : 'auto',
                            overflow: 'auto',
                            '&::-webkit-scrollbar': {
                              width: '8px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: '#E5E7EB',
                              borderRadius: '4px',
                            },
                          }}
                        >
                          {isLoading ? (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                              <CircularProgress size={24} />
                            </Box>
                          ) : error ? (
                            <Typography sx={{ p: 2, color: 'error.main' }}>{error}</Typography>
                          ) : filteredItems.length === 0 ? (
                            <Typography sx={{ p: 2, color: 'text.secondary', textAlign: 'center' }}>
                              No matches found
                            </Typography>
                          ) : (
                            filteredItems.map((item) => (
                              <Box
                                key={item.id}
                                onClick={() => {
                                  handleItemToggle(item);
                                  setShowItemsList(false);
                                }}
                                sx={{
                                  p: 1.5,
                                  cursor: 'pointer',
                                  '&:hover': { bgcolor: '#F5F6FF' },
                                  display: 'grid',
                                  gridTemplateColumns: 'auto 80px 1fr auto',
                                  alignItems: 'center', 
                                  gap: 2,
                                  width: '100%'
                                }}
                              >
                                <Checkbox 
                                  checked={isItemSelected(item)}
                                  sx={{ p: 0 }}
                                />
                                <Typography variant="body2" noWrap>
                                  {item.id.slice(-6)}
                                </Typography>
                                <Typography variant="body2" noWrap>
                                  {item.name}
                                </Typography>
                                <Chip
                                  label={item.type === 'module' ? `Module | ${item.simCount} Sim` : 'Sim'}
                                  size="small"
                                  sx={{
                                    bgcolor: '#F5F6FF',
                                    color: '#444CE7',
                                    justifySelf: 'end'
                                  }}
                                />
                              </Box>
                            ))
                          )}
                        </Box>
                      )}
                    </Box>
                  </ClickAwayListener>
                </Box>

                {selectedItems.length > 0 && (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.id.slice(-6)}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.type === 'module' ? `Module | ${item.simCount} Sim` : 'Sim'}
                                size="small"
                                sx={{
                                  bgcolor: '#F5F6FF',
                                  color: '#444CE7',
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => removeItem(item)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Stack>
            </Box>

            {updateSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Training plan updated successfully!
              </Alert>
            )}

            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!isValid || isSubmitting}
              sx={{
                mt: 2,
                py: 1.5,
                bgcolor: '#444CE7',
                color: 'white',
                '&:hover': {
                  bgcolor: '#3538CD',
                },
                '&.Mui-disabled': {
                  bgcolor: '#F5F6FF',
                  color: '#444CE7',
                },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Updating...
                </Box>
              ) : (
                'Update Training Plan'
              )}
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTrainingPlanDialog;