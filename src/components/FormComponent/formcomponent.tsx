import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Picker } from '@react-native-picker/picker';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FormData {
  supportId: string;
  clientName: string;
  dateTime: string;
  problemType: string;
  problemDescription: string;
  technician: string;
  additionalNotes: string;
}

const FormularioComponent: React.FC = () => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const [problemType, setProblemType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const createPDF = async (data: FormData) => {
    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background-color: #121212; color: #fff; }
            h1 { color: #BB86FC; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; color: #fff; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background-color: #1E1E1E; }
            tr:nth-child(even) { background-color: #2E2E2E; }
          </style>
        </head>
        <body>
          <h1>Levantamiento de Soporte Técnico</h1>
          <table>
            <tr>
              <th>ID o Número de Soporte</th>
              <td>${data.supportId}</td>
            </tr>
            <tr>
              <th>Nombre del Cliente</th>
              <td>${data.clientName}</td>
            </tr>
            <tr>
              <th>Fecha y Hora</th>
              <td>${date.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Tipo de Problema</th>
              <td>${data.problemType || problemType}</td>
            </tr>
            <tr>
              <th>Descripción del Problema</th>
              <td>${data.problemDescription}</td>
            </tr>
            <tr>
              <th>Responsable (Técnico)</th>
              <td>${data.technician}</td>
            </tr>
            <tr>
              <th>Observaciones Adicionales</th>
              <td>${data.additionalNotes || 'N/A'}</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      const options = {
        html: htmlContent,
        fileName: `Soporte_${data.supportId}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      Alert.alert('PDF Generado', `El archivo PDF se ha guardado en: ${file.filePath}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF. Inténtalo nuevamente.');
      console.error(error);
    }
  };

  const onSubmit = async (data: FormData) => {
    await createPDF(data);
    reset();
    setProblemType('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Formulario de Levantamiento</Text>

      {/* ID o Número de Soporte */}
      <Text style={styles.label}>ID o Número de Soporte</Text>
      <Controller
        control={control}
        name="supportId"
        rules={{ required: 'El ID o número de soporte es obligatorio' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.supportId && styles.errorInput]}
            placeholder="Ej. 12345"
            placeholderTextColor="#888"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.supportId && <Text style={styles.errorText}>{errors.supportId.message}</Text>}

      {/* Nombre del Cliente */}
      <Text style={styles.label}>Nombre del Cliente</Text>
      <Controller
        control={control}
        name="clientName"
        rules={{ required: 'El nombre del cliente es obligatorio' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.clientName && styles.errorInput]}
            placeholder="Nombre del cliente"
            placeholderTextColor="#888"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.clientName && <Text style={styles.errorText}>{errors.clientName.message}</Text>}

      {/* Fecha y Hora */}
      <Text style={styles.label}>Fecha y Hora del Levantamiento</Text>
      <View>
        <Button title="Seleccionar Fecha y Hora" onPress={() => setShowPicker(true)} color="#BB86FC" />
        <Text style={styles.dateText}>{date.toLocaleString()}</Text>
      </View>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {/* Tipo de Problema */}
      <Text style={styles.label}>Tipo de Problema</Text>
      <Picker
        selectedValue={problemType}
        onValueChange={(value) => setProblemType(value)}
        style={styles.inputPicker}
      >
        <Picker.Item label="Selecciona un tipo de problema" value="" />
        <Picker.Item label="Hardware" value="Hardware" />
        <Picker.Item label="Software" value="Software" />
        <Picker.Item label="Redes" value="Redes" />
        <Picker.Item label="Otro" value="Otro" />
      </Picker>

      {/* Botón de Enviar */}
      <Button title="Enviar y Generar PDF" onPress={handleSubmit(onSubmit)} color="#BB86FC" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#121212',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#BB86FC',
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
  },
  inputPicker: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    marginBottom: 16,
  },
  dateText: {
    color: '#fff',
    marginTop: 8,
  },
  errorInput: {
    borderColor: '#CF6679',
  },
  errorText: {
    color: '#CF6679',
    marginBottom: 8,
  },
});

export default FormularioComponent;
